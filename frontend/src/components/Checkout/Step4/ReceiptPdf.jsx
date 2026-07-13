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

export const createReceiptPdf = async ({ order, address, paymentName, shippingName, shippingCost, ivaAmount, orderTotal }) => {
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

  let y = 97;
  pdf.setFont('helvetica', 'bold'); pdf.text('Productos', 20, y); y += 8;
  pdf.setFont('helvetica', 'normal');
  order.products.forEach((product) => {
    const productLines = pdf.splitTextToSize(`${product.quantity} × ${product.name}`, 125);
    pdf.text(productLines, 20, y);
    pdf.text(money.format(product.price * product.quantity), 155, y);
    y += Math.max(7, productLines.length * 5 + 2);
  });

  pdf.line(20, y + 2, 190, y + 2); y += 12;
  pdf.text('Subtotal', 20, y); pdf.text(money.format(order.subtotal), 155, y); y += 8;
  pdf.text(`Envío (${shippingName})`, 20, y); pdf.text(money.format(shippingCost), 155, y); y += 8;
  pdf.text('IVA (16%)', 20, y); pdf.text(money.format(ivaAmount), 155, y); y += 10;
  pdf.setFont('helvetica', 'bold'); pdf.text('Total final', 20, y); pdf.text(money.format(orderTotal), 155, y);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.text('Gracias por comprar en FIRSTPC.', 20, y + 18);
  pdf.save(`${order.orderNumber}.pdf`);
};

const ReceiptPdf = ({ order, address, paymentName, shippingName, shippingCost, ivaAmount, orderTotal }) => (
  <button
    type="button"
    onClick={() => createReceiptPdf({ order, address, paymentName, shippingName, shippingCost, ivaAmount, orderTotal })}
    className="mt-8 w-full rounded-full bg-[#10B981] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(16,185,129,0.24)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
  >
    Descargar Comprobante en PDF
  </button>
);

export default ReceiptPdf;
