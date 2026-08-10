const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { initializeApp } = require('firebase-admin/app');
const nodemailer = require('nodemailer');

initializeApp();
const db = getFirestore();

const BRAND_EMAIL = 'contacto.firstpc@gmail.com';
const gmailAppPassword = defineSecret('GMAIL_APP_PASSWORD');

const getDemoShipmentSteps = (carrierId) => [
  { status: 'preparacion', labelStatus: 'En preparación' },
  { status: 'recolectado', labelStatus: `Recolectado por ${carrierId === 'dhl' ? 'DHL' : 'Estafeta'}` },
  { status: 'transito', labelStatus: 'En tránsito' },
  { status: 'ruta_entrega', labelStatus: 'En ruta de entrega' },
  { status: 'entregado', labelStatus: 'Entregado' },
];

const getDate = (value) => value?.toDate ? value.toDate() : value ? new Date(value) : null;

// Sincroniza el progreso de las guías demo con el estado de cada orden.
exports.syncDemoShipmentStatuses = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'America/Mexico_City', region: 'us-central1' },
  async () => {
    const snapshot = await db.collection('orders')
      .where('shipping.shipment.isDemo', '==', true)
      .limit(500)
      .get();

    const now = Date.now();
    let updated = 0;
    for (const orderSnapshot of snapshot.docs) {
      const order = orderSnapshot.data();
      const shipment = order.shipping?.shipment;
      if (order.paymentMethod === 'oxxo' && order.status === 'Pendiente de pago') continue;
      const demoShipmentSteps = getDemoShipmentSteps(shipment.carrierId);
      const createdAt = getDate(shipment?.demoStartedAt) || getDate(order.createdAt);
      if (!createdAt) continue;

      const elapsedDays = Math.max(0, Math.floor((now - createdAt.getTime()) / 86_400_000));
      const step = demoShipmentSteps[Math.min(demoShipmentSteps.length - 1, elapsedDays)];
      const nextData = {
        'shipping.shipment.status': step.status,
        'shipping.shipment.labelStatus': step.labelStatus,
        'shipping.shipment.updatedAt': FieldValue.serverTimestamp(),
      };
      if (step.status === 'entregado' && order.status !== 'Entregado') {
        nextData.status = 'Entregado';
        nextData.receivedAt = FieldValue.serverTimestamp();
      }

      await orderSnapshot.ref.update(nextData);
      updated += 1;
    }

    console.log(`Guías demo sincronizadas: ${updated}`);
  },
);

exports.sendSupportEmail = onCall(
  { secrets: [gmailAppPassword], region: 'us-central1' },
  async (request) => {
    const { name, email, subject, message, attachments = [] } = request.data || {};

    if (![name, email, subject, message].every((value) => typeof value === 'string' && value.trim())) {
      throw new HttpsError('invalid-argument', 'Todos los campos son obligatorios.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new HttpsError('invalid-argument', 'El correo electrónico no es válido.');
    }
    if (!Array.isArray(attachments) || attachments.length > 5 || attachments.some((attachment) => !attachment || typeof attachment.url !== 'string' || typeof attachment.name !== 'string')) {
      throw new HttpsError('invalid-argument', 'Los archivos adjuntos no son válidos.');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: BRAND_EMAIL,
        pass: gmailAppPassword.value(),
      },
    });

    try {
      await transporter.sendMail({
        from: `FIRSTPC Soporte <${BRAND_EMAIL}>`,
        to: BRAND_EMAIL,
        replyTo: email.trim(),
        subject: `[Soporte FIRSTPC] ${subject.trim()}`,
        text: `Nombre: ${name.trim()}\nCorreo: ${email.trim()}\n\n${message.trim()}${attachments.length ? `\n\nArchivos adjuntos:\n${attachments.map((attachment) => `- ${attachment.name}: ${attachment.url}`).join('\n')}` : ''}`,
        attachments: attachments.map((attachment) => ({
          filename: attachment.name,
          path: attachment.url,
          contentType: attachment.type || undefined,
        })),
      });

      return { success: true };
    } catch (error) {
      console.error('Error enviando correo de soporte:', error);
      throw new HttpsError('internal', 'No se pudo enviar el correo.');
    }
  },
);

// Publica opiniones únicamente después de comprobar que el usuario compró el producto.
exports.submitProductReview = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Inicia sesión para opinar.');
  const { productId, rating, comment } = request.data || {};
  const numericRating = Number(rating);
  const cleanComment = typeof comment === 'string' ? comment.trim() : '';
  if (typeof productId !== 'string' || !productId || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5 || cleanComment.length < 5 || cleanComment.length > 800) {
    throw new HttpsError('invalid-argument', 'La opinión no tiene un formato válido.');
  }

  const productRef = db.doc(`products/${productId}`);
  const reviewRef = db.doc(`products/${productId}/reviews/${request.auth.uid}`);
  const userReviewRef = db.doc(`users/${request.auth.uid}/reviews/${productId}`);
  const productSnapshot = await productRef.get();
  if (!productSnapshot.exists) throw new HttpsError('not-found', 'El producto no existe.');

  const ordersSnapshot = await db.collection('orders').where('userId', '==', request.auth.uid).get();
  const purchased = ordersSnapshot.docs.some((orderSnapshot) => {
    const order = orderSnapshot.data();
    const validStatus = order.status === 'Entregado';
    return validStatus && (order.products || []).some((item) => item.id === productId);
  });
  if (!purchased) throw new HttpsError('permission-denied', 'Solo las personas que compren este producto pueden opinar.');

  await db.runTransaction(async (transaction) => {
    const [currentProduct, previousReview] = await Promise.all([transaction.get(productRef), transaction.get(reviewRef)]);
    const product = currentProduct.data() || {};
    const previousRating = previousReview.exists ? Number(previousReview.data().rating) : null;
    const count = Number(product.reviewsCount) || 0;
    const total = Number.isFinite(Number(product.ratingTotal)) ? Number(product.ratingTotal) : (Number(product.rating) || 0) * count;
    const nextCount = previousRating === null ? count + 1 : count;
    const nextTotal = previousRating === null ? total + numericRating : total - previousRating + numericRating;
    const review = { userId: request.auth.uid, authorName: request.auth.token.name || request.auth.token.email?.split('@')[0] || 'Cliente verificado', rating: numericRating, comment: cleanComment, verifiedPurchase: true, updatedAt: FieldValue.serverTimestamp() };
    transaction.set(reviewRef, review, { merge: true });
    transaction.set(userReviewRef, { productId, productName: product.name || 'Producto', productImage: product.images?.[0] || product.image || '', ...review }, { merge: true });
    transaction.update(productRef, { rating: Number((nextTotal / nextCount).toFixed(1)), ratingTotal: nextTotal, reviewsCount: nextCount, updatedAt: FieldValue.serverTimestamp() });
  });
  return { success: true };
});

// Libera automáticamente las piezas reservadas para pedidos OXXO que no fueron pagados.
// Se ejecuta cada 15 minutos, por lo que una reserva se libera como máximo 15 minutos
// después de cumplir las 24 horas.
exports.releaseExpiredOxxoReservations = onSchedule(
  { schedule: 'every 15 minutes', timeZone: 'America/Mexico_City', region: 'us-central1' },
  async () => {
    const now = Timestamp.now();
    const snapshot = await db.collection('orders')
      .where('reservationExpiresAt', '<=', now)
      .limit(500)
      .get();

    let released = 0;
    for (const orderSnapshot of snapshot.docs) {
      await db.runTransaction(async (transaction) => {
        const currentOrderSnapshot = await transaction.get(orderSnapshot.ref);
        if (!currentOrderSnapshot.exists) return;

        const order = currentOrderSnapshot.data();
        const expiresAt = order.reservationExpiresAt;
        if (order.paymentMethod !== 'oxxo'
          || order.status !== 'Pendiente de pago'
          || !expiresAt?.toMillis
          || expiresAt.toMillis() > now.toMillis()) return;

        const reservations = Array.isArray(order.stockReservations) ? order.stockReservations : [];
        const productSnapshots = await Promise.all(
          reservations.map(({ id }) => transaction.get(db.doc(`products/${id}`))),
        );

        productSnapshots.forEach((productSnapshot, index) => {
          if (!productSnapshot.exists) return;
          const quantity = Math.max(0, Number(reservations[index].quantity) || 0);
          if (quantity > 0) {
            const currentStock = Math.max(0, Number(productSnapshot.data().stock) || 0);
            transaction.update(productSnapshot.ref, { stock: currentStock + quantity });
          }
        });

        transaction.update(orderSnapshot.ref, {
          status: 'Cancelado por falta de pago',
          isReserved: false,
          reservationExpiredAt: FieldValue.serverTimestamp(),
          reservationExpiresAt: null,
          stockReservations: [],
        });
        released += 1;
      });
    }

    console.log(`Reservas OXXO liberadas: ${released}`);
  },
);
