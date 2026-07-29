import { collection, doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { enviarOrdenDropshipping } from './dropshipService';
import { getFulfillment, isDistributorIntegrated } from '../components/AdminInventory/inventory';
import { db } from '../firebaseConfig';

const getPurchasableItems = (cartItems) => cartItems.filter((item) => !item.id?.startsWith('firstpc-assembly-service'));

export const createCheckoutOrder = async ({
  cartItems,
  address,
  billing,
  shipping,
  selectedPaymentMethod,
  totalAmount,
  shippingCost,
  ivaAmount,
  orderTotal,
  userId,
}) => {
  const createdAt = new Date();
  const purchasableItems = getPurchasableItems(cartItems);
  const productReferences = purchasableItems.map((item) => doc(db, 'products', item.id));
  const productSnapshots = await Promise.all(productReferences.map((reference) => getDoc(reference)));
  const localQuantities = new Map();
  const dropshipItems = [];

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
    const distributorResponse = await enviarOrdenDropshipping(dropshipItems, address);
    distributorOrderId = distributorResponse.distributorOrderId || distributorResponse.orderId || null;
  }

  const orderData = {
    userId,
    orderNumber: `FPC-${createdAt.getTime().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
    products: cartItems.map(({ id, name, title, images, image, price, quantity }) => ({
      id,
      name: name || title || 'Producto',
      image: images?.[0] || image || '',
      price: Number(price) || 0,
      quantity,
    })),
    shipping: { carrier: shipping.name, id: shipping.id, cost: shippingCost, address },
    billing: billing || { note: 'Factura de público general con RFC genérico' },
    paymentMethod: selectedPaymentMethod,
    subtotal: totalAmount,
    ivaRate: 0.16,
    ivaAmount,
    shippingCost,
    totalPaid: orderTotal,
    createdAt: serverTimestamp(),
    status: selectedPaymentMethod === 'oxxo' ? 'Pendiente de pago' : 'Procesado',
    hasDropshipping: dropshipItems.length > 0,
    distributorOrderId,
    isReserved: selectedPaymentMethod === 'oxxo',
  };

  const orderReference = doc(collection(db, 'orders'));
  await runTransaction(db, async (transaction) => {
    const currentSnapshots = await Promise.all(productReferences.map((reference) => transaction.get(reference)));

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
