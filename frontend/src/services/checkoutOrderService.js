import { collection, doc, getDoc, runTransaction, serverTimestamp, Timestamp } from 'firebase/firestore';
import { enviarOrdenDropshipping } from './dropshipService';
import { getFulfillment, isDistributorIntegrated } from '../components/AdminInventory/inventory';
import { db } from '../firebaseConfig';
import { createDemoShipment } from './estafetaDemoService';

const getPurchasableItems = (cartItems) => cartItems.filter((item) => !item.id?.startsWith('firstpc-assembly-service'));

export const createCheckoutOrder = async ({
  cartItems,
  address,
  shipping,
  selectedPaymentMethod,
  totalAmount,
  shippingCost,
  ivaAmount,
  orderTotal,
  userId,
  customerName,
  customerEmail,
  coupon,
  discountAmount = 0,
}) => {
  const createdAt = new Date();
  const purchasableItems = getPurchasableItems(cartItems);
  const productReferences = purchasableItems.map((item) => doc(db, 'products', item.id));
  const productSnapshots = await Promise.all(productReferences.map((reference) => getDoc(reference)));
  const localQuantities = new Map();
  const stockReservations = [];
  const dropshipItems = [];
  const fulfillmentByProduct = new Map();

  productSnapshots.forEach((productSnapshot, index) => {
    const item = purchasableItems[index];
    if (!productSnapshot.exists()) throw new Error(`PRODUCT_NOT_FOUND:${item.name || item.id}`);

    const productData = productSnapshot.data();
    const distributorSku = productData.distributorSku || productData.sku_distribuidor;
    const currentStock = Number(productData.stock) || 0;
    const quantity = Number(item.quantity) || 0;
    const { localQuantity, distributorQuantity } = getFulfillment(productData, quantity);

    console.log('Distribución de inventario:', {
      productId: item.id,
      distributorSku,
      stockLocal: currentStock,
      cantidadSolicitada: quantity,
      cantidadLocal: localQuantity,
      cantidadDistribuidor: distributorQuantity,
    });

    localQuantities.set(item.id, localQuantity);
    fulfillmentByProduct.set(item.id, { requestedQuantity: quantity, localQuantity, distributorQuantity });
    if (selectedPaymentMethod === 'oxxo' && localQuantity > 0) {
      stockReservations.push({ id: item.id, quantity: localQuantity });
    }

    if (distributorQuantity > 0) {
      if (!isDistributorIntegrated(productData) || !distributorSku) {
        throw new Error(`INSUFFICIENT_STOCK:${item.name || 'Producto'}`);
      }

      dropshipItems.push({
        id: item.id,
        name: item.name || item.title,
        quantity: distributorQuantity,
        distributorSku,
      });
    }
  });

  let distributorOrderId = null;
  if (dropshipItems.length > 0) {
    console.log('Enviando petición de Dropshipping al distribuidor...', dropshipItems);
    const distributorResponse = await enviarOrdenDropshipping(dropshipItems);
    distributorOrderId = distributorResponse.distributorOrderId || distributorResponse.orderId || null;
  }

  const orderNumber = `FPC-${createdAt.getTime().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
  const oxxoReference = selectedPaymentMethod === 'oxxo'
    ? `OXXO-${String(createdAt.getTime()).slice(-10)}`
    : null;
  const demoShipment = ['estafeta', 'dhl'].includes(shipping?.id)
    ? await createDemoShipment({ carrierId: shipping.id, orderNumber, address, shippingCost })
    : null;

  const orderData = {
    userId,
    customer: {
      name: customerName || `${address?.firstName || ''} ${address?.lastName || ''}`.trim() || 'Cliente registrado',
      email: customerEmail || '',
    },
    orderNumber,
    products: cartItems.map(({ id, name, title, images, image, price, quantity }) => ({
      id,
      name: name || title || 'Producto',
      image: images?.[0] || image || '',
      price: Number(price) || 0,
      quantity,
      requestedQuantity: fulfillmentByProduct.get(id)?.requestedQuantity || Number(quantity) || 0,
      localQuantity: fulfillmentByProduct.get(id)?.localQuantity || 0,
      distributorQuantity: fulfillmentByProduct.get(id)?.distributorQuantity || 0,
    })),
    shipping: { carrier: shipping.name, id: shipping.id, cost: shippingCost, address, shipment: demoShipment },
    paymentMethod: selectedPaymentMethod,
    oxxoReference,
    subtotal: totalAmount,
    discountAmount,
    couponCode: coupon?.code || null,
    ivaRate: 0.16,
    ivaAmount,
    shippingCost,
    totalPaid: orderTotal,
    createdAt: serverTimestamp(),
    status: selectedPaymentMethod === 'oxxo' ? 'Pendiente de pago' : 'Procesado',
    hasDropshipping: dropshipItems.length > 0,
    distributorOrderId,
    isReserved: selectedPaymentMethod === 'oxxo',
    reservationExpiresAt: selectedPaymentMethod === 'oxxo'
      ? Timestamp.fromDate(new Date(createdAt.getTime() + 24 * 60 * 60 * 1000))
      : null,
    stockReservations,
  };

  const orderReference = doc(collection(db, 'orders'));
  const couponReference = coupon?.code ? doc(db, 'welcomeCoupons', userId) : null;
  await runTransaction(db, async (transaction) => {
    const currentSnapshots = await Promise.all(productReferences.map((reference) => transaction.get(reference)));
    const couponSnapshot = couponReference ? await transaction.get(couponReference) : null;

    if (couponReference) {
      if (!couponSnapshot?.exists()) throw new Error('COUPON_INVALID');
      const couponData = couponSnapshot.data();
      if (couponData.userId !== userId || couponData.code !== coupon.code) throw new Error('COUPON_INVALID');
      if (couponData.status === 'used') throw new Error('COUPON_ALREADY_USED');
      if (couponData.status !== 'active') throw new Error('COUPON_INVALID');
      transaction.update(couponReference, { status: 'used', usedAt: serverTimestamp(), orderId: orderReference.id });
    }

    currentSnapshots.forEach((productSnapshot, index) => {
      const item = purchasableItems[index];
      if (!productSnapshot.exists()) throw new Error(`PRODUCT_NOT_FOUND:${item.name || item.id}`);

      const currentStock = Number(productSnapshot.data().stock) || 0;
      const localQuantity = localQuantities.get(item.id) || 0;
      if (currentStock < localQuantity) throw new Error(`INSUFFICIENT_STOCK:${item.name || 'Producto'}`);
      if (localQuantity > 0) transaction.update(productSnapshot.ref, { stock: currentStock - localQuantity });
    });

    transaction.set(orderReference, orderData);
  });

  return { id: orderReference.id, ...orderData, createdAt };
};
