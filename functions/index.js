const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require('nodemailer');

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
