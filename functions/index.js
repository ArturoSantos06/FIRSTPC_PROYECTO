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

exports.sendSupportEmail = onCall(
  { secrets: [gmailAppPassword], region: 'us-central1' },
  async (request) => {
    const { name, email, subject, message } = request.data || {};

    if (![name, email, subject, message].every((value) => typeof value === 'string' && value.trim())) {
      throw new HttpsError('invalid-argument', 'Todos los campos son obligatorios.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new HttpsError('invalid-argument', 'El correo electrónico no es válido.');
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
        text: `Nombre: ${name.trim()}\nCorreo: ${email.trim()}\n\n${message.trim()}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error enviando correo de soporte:', error);
      throw new HttpsError('internal', 'No se pudo enviar el correo.');
    }
  },
);

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
