import { jsPDF } from 'jspdf';
import logo from '../../../assets/logof.png';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const dateLabel = (date) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(date || new Date());

const loadImageAsDataUrl = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const createReceiptPdf = async ({ order, address, billing, paymentName, shippingName, shippingCost, ivaAmount, orderTotal, download = true, pdfWindow = null }) => {
  const pdf = new jsPDF();
  pdf.setTextColor(15, 23, 42);

  try {
    const logoData = await loadImageAsDataUrl(logo);
    const imageProperties = pdf.getImageProperties(logoData);
    const maxWidth = 42;
    const maxHeight = 16;
    const scale = Math.min(maxWidth / imageProperties.width, maxHeight / imageProperties.height);
    const imageWidth = imageProperties.width * scale;
    const imageHeight = imageProperties.height * scale;
    pdf.addImage(logoData, 'PNG', 20, 12, imageWidth, imageHeight);
  } catch (error) {
    console.warn('No fue posible cargar el logotipo en el comprobante:', error);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(22); pdf.text('FIRSTPC', 20, 25);
  }

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10);
  pdf.text(`Comprobante de compra · ${order.orderNumber}`, 20, 36);
  pdf.text(`Fecha: ${dateLabel(order.createdAt)}`, 20, 43);
  pdf.setDrawColor(16, 185, 129); pdf.line(20, 49, 190, 49);

  pdf.setFont('helvetica', 'bold'); pdf.text('Cliente', 20, 61);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${address?.firstName || ''} ${address?.lastName || ''}`.trim() || 'Cliente registrado', 20, 68);
  pdf.text(address?.phone || 'Sin teléfono', 20, 75);
  pdf.text(`Pago: ${paymentName}`, 20, 82);

  let y = 94;
  pdf.setFont('helvetica', 'bold'); pdf.text('Envío', 20, y); y += 7;
  pdf.setFont('helvetica', 'normal');
  const addressText = address ? `${address.street || ''} ${address.exteriorNumber || ''}${address.interiorNumber ? ` Int. ${address.interiorNumber}` : ''}, ${address.neighborhood || ''}, C.P. ${address.postalCode || ''}, ${address.city || ''}, ${address.state || ''}` : 'Domicilio no registrado';
  const addressLines = pdf.splitTextToSize(addressText, 165);
  pdf.text(addressLines, 20, y); y += Math.max(7, addressLines.length * 5 + 2);
  pdf.text(`Paquetería: ${shippingName}`, 20, y); y += 7;
  pdf.text(`RFC: ${billing?.rfc || 'XAXX010101000'}`, 20, y);
  y += 12;
  pdf.setFont('helvetica', 'bold'); pdf.text('Productos', 20, y); y += 8;
  pdf.setFont('helvetica', 'normal');
  order.products.forEach((product) => {
    const productLines = pdf.splitTextToSize(`${product.quantity} × ${product.name}`, 125);
    pdf.text(productLines, 20, y);
    const productGrossTotal = Number(product.price) * Number(product.quantity || 0);
    pdf.text(money.format(productGrossTotal), 155, y);
    y += Math.max(7, productLines.length * 5 + 2);
  });

  pdf.line(20, y + 2, 190, y + 2); y += 12;
  const grossSubtotal = Number(order.subtotal) || 0;
  const discountAmount = Number(order.discountAmount) || 0;
  const discountedGrossProducts = Math.max(0, grossSubtotal - discountAmount);
  const subtotalBeforeIva = discountedGrossProducts / 1.16;
  const calculatedIvaAmount = discountedGrossProducts - subtotalBeforeIva;
  pdf.text(`Envío (${shippingName})`, 20, y); pdf.text(money.format(shippingCost), 155, y); y += 8;
  pdf.text('Subtotal antes de IVA', 20, y); pdf.text(money.format(subtotalBeforeIva), 155, y); y += 8;
  if (discountAmount > 0) {
    pdf.text(`Promoción aplicada${order.couponCode ? ` (${order.couponCode})` : ''}`, 20, y); pdf.text(`-${money.format(discountAmount)}`, 155, y); y += 8;
  }
  pdf.text('IVA (16%)', 20, y); pdf.text(money.format(Number(ivaAmount) || calculatedIvaAmount), 155, y); y += 9;
  pdf.setFont('helvetica', 'bold'); pdf.text('Total (IVA incluido)', 20, y); pdf.text(money.format(orderTotal), 155, y);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.text('Gracias por comprar en FIRSTPC.', 20, y + 18);
  pdf.setFontSize(8); pdf.setTextColor(100, 116, 139);
  const disclaimer = pdf.splitTextToSize('Este documento es una representación gráfica simulada con fines educativos.', 170);
  pdf.text(disclaimer, 20, y + 29);
  if (download) {
    pdf.save(`${order.orderNumber}.pdf`);
    return;
  }

  const pdfUrl = URL.createObjectURL(pdf.output('blob'));
  if (pdfWindow && !pdfWindow.closed) {
    pdfWindow.location.href = pdfUrl;
  } else {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  }
};

export const openReceiptPdf = async (options) => {
  const pdfWindow = window.open('', '_blank');
  if (pdfWindow) {
    pdfWindow.document.title = 'Comprobante de compra';
    pdfWindow.document.body.innerHTML = '<p style="font-family: sans-serif; padding: 2rem;">Generando comprobante...</p>';
  }

  try {
    await createReceiptPdf({ ...options, download: false, pdfWindow });
  } catch (error) {
    if (pdfWindow && !pdfWindow.closed) pdfWindow.close();
    throw error;
  }
};

const ReceiptPdf = ({ order, address, billing, paymentName, shippingName, shippingCost, ivaAmount, orderTotal }) => (
  <button
    type="button"
    onClick={() => createReceiptPdf({ order, address, billing, paymentName, shippingName, shippingCost, ivaAmount, orderTotal })}
    className="mt-8 w-full rounded-full bg-[#10B981] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
  >
    Descargar Comprobante en PDF
  </button>
);

export default ReceiptPdf;
