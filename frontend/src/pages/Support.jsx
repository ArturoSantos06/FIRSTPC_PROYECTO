import { useContext, useState } from 'react';
import { CheckCircle2, Mail, MessageSquare, Send, User, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import { AuthContext } from '../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../firebaseConfig';

const BRAND_EMAIL = 'contacto.firstpc@gmail.com';

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

const Support = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState(() => ({ ...initialForm, email: user?.email || '' }));
  const [isSent, setIsSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSending(true);

    try {
      const functions = getFunctions(app, 'us-central1');
      const sendSupportEmail = httpsCallable(functions, 'sendSupportEmail');
      await sendSupportEmail(form);
      setIsSent(true);
    } catch (error) {
      console.error('Error enviando solicitud de soporte:', error);
      setErrorMessage('No pudimos enviar tu mensaje. Inténtalo nuevamente en unos momentos.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="bg-[#F8FAFC] px-4 pt-28 font-['Montserrat'] text-slate-800 md:px-8">
      <Navbar />
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
            ¿En qué podemos <span className="text-emerald-500">ayudarte?</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">
            Cuéntanos qué necesitas y nuestro equipo se pondrá en contacto contigo lo antes posible.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] md:grid-cols-[0.8fr_1.2fr]">
          <aside className="border-b border-emerald-100 bg-emerald-50/70 p-7 text-slate-800 md:border-b-0 md:border-r md:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Mail size={23} />
            </div>
            <h2 className="mt-7 text-2xl font-black text-slate-900">Contáctanos</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              Para dudas sobre pedidos, productos, garantías o cualquier otro tema, escríbenos directamente.
            </p>
            <div className="mt-8 border-t border-emerald-200 pt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Correo de soporte</p>
              <span className="mt-2 block break-all text-sm font-bold text-emerald-600">
                {BRAND_EMAIL}
              </span>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="space-y-5 p-7 md:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre" name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" icon={<User size={16} />} required />
              <Field label="Correo electrónico" name="email" type="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" icon={<Mail size={16} />} required />
            </div>
            <Field label="Asunto" name="subject" value={form.subject} onChange={handleChange} placeholder="¿Sobre qué necesitas ayuda?" required />
            <div>
              <label htmlFor="message" className="mb-2 block text-xs font-black text-slate-700">Mensaje</label>
              <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder="Escribe aquí los detalles de tu solicitud..." rows={6} required className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" />
            </div>
            {errorMessage && <p role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">{errorMessage}</p>}
            <button type="submit" disabled={isSending} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60">
              {isSending ? 'Enviando mensaje...' : 'Enviar mensaje'} <Send size={16} />
            </button>
          </form>
        </div>
      </section>

      <div className="mt-24"><Footer /></div>

      {isSent && <SuccessModal onClose={() => { setIsSent(false); setForm((current) => ({ ...initialForm, email: current.email })); }} />}
    </main>
  );
};

const Field = ({ label, name, type = 'text', value, onChange, placeholder, icon, required }) => (
  <div>
    <label htmlFor={name} className="mb-2 block text-xs font-black text-slate-700">{label}</label>
    <div className="relative">
      {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
      <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 ${icon ? 'pl-11 pr-4' : 'px-4'}`} />
    </div>
  </div>
);

const SuccessModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 font-['Montserrat'] backdrop-blur-sm">
    <div role="dialog" aria-modal="true" aria-labelledby="support-success-title" className="relative w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-[0_25px_80px_rgba(15,23,42,0.2)]">
      <button type="button" onClick={onClose} aria-label="Cerrar modal" className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
      <CheckCircle2 className="mx-auto text-emerald-500" size={54} />
      <h2 id="support-success-title" className="mt-5 text-2xl font-black text-slate-900">¡Mensaje enviado!</h2>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">Recibimos tu solicitud. Te responderemos lo antes posible.</p>
      <button type="button" onClick={onClose} className="mt-7 rounded-full bg-emerald-500 px-7 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Continuar</button>
    </div>
  </div>
);

export default Support;
