import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getOrCreateWelcomeCoupon } from '../../services/couponService';

const CouponModal = ({ coupon, message, onClose }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4 font-['Montserrat'] backdrop-blur-sm">
    <div className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-2xl">
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-500">Beneficio de bienvenida</p>
      <h2 className="mt-3 text-2xl font-black text-slate-900">{coupon ? '¡Descuento reclamado!' : 'Descuento no disponible'}</h2>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{message}</p>
      {coupon && <div className="mt-6 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-4"><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Tu código</p><p className="mt-2 select-all text-2xl font-black tracking-wider text-slate-900">{coupon.code}</p><p className="mt-2 text-xs font-semibold text-slate-500">Úsalo en tu primera compra.</p></div>}
      <button type="button" onClick={onClose} className="mt-6 w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Entendido</button>
    </div>
  </div>
);

const FirstPurchaseBanner = () => {
  const { user } = useContext(AuthContext);
  const [coupon, setCoupon] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }

    setIsClaiming(true);
    try {
      const issuedCoupon = await getOrCreateWelcomeCoupon({ userId: user.uid, email: user.email });
      setCoupon(issuedCoupon);
      setModalMessage('Guarda este código. Podrás aplicarlo una sola vez durante tu primera compra.');
    } catch (error) {
      setCoupon(null);
      setModalMessage(error.message === 'WELCOME_COUPON_NOT_AVAILABLE' ? 'Este beneficio es válido únicamente para usuarios que aún no han realizado una compra.' : error.message === 'COUPON_PERMISSION' ? 'Firestore está bloqueando la colección de cupones. Hay que actualizar las reglas de seguridad para habilitar este beneficio.' : 'No pudimos generar tu código. Inténtalo nuevamente.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl overflow-hidden px-6 py-12 font-['Montserrat'] md:px-10">
      <div className="group relative z-10 flex flex-col items-center justify-between gap-8 overflow-hidden rounded-[32px] border border-slate-100 bg-white p-8 shadow-[0_15px_40px_rgba(100,116,139,0.04)] lg:flex-row md:p-12">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-[#A7F3D0]/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-60 w-60 translate-x-20 translate-y-20 transform rounded-full bg-[#10B981]/5 blur-3xl transition-transform duration-500 group-hover:scale-110" />
        <div className="relative z-10 max-w-2xl space-y-4 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 rounded-full bg-[#A7F3D0]/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#0ea472]">Beneficio de Bienvenida</div>
          <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-800 md:text-4xl">Tu próximo Setup <span className="text-[#10B981]">con Descuento</span></h2>
          <p className="text-sm font-medium leading-relaxed text-[#64748B] md:text-base">¿Es tu primera vez en FIRSTPC? Queremos que armes tu computadora con los mejores componentes. Regístrate hoy y recibe un <span className="font-bold text-slate-800">10% de descuento inmediato</span> aplicable en todo nuestro catálogo de hardware.</p>
          <p className="text-[11px] font-semibold text-slate-400">* Válido únicamente para nuevos usuarios en su primera orden de compra</p>
        </div>
        <div className="relative z-10 flex min-w-[260px] flex-col items-center justify-center rounded-[24px] border border-slate-50 bg-white p-6 text-center shadow-[0_8px_20px_rgba(0,0,0,0.01)]">
          <div className="mb-1 text-5xl font-black tracking-tighter text-slate-800">10%<span className="text-3xl font-black text-[#10B981]"> OFF</span></div>
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-[#64748B]">En tu Primera Compra</div>
          <button type="button" onClick={handleClaim} disabled={isClaiming} className="w-full rounded-full bg-[#10B981] px-8 py-4 text-center text-base font-bold text-white shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0ea472] disabled:cursor-wait disabled:opacity-60">{isClaiming ? 'Generando código...' : 'Reclamar mi Descuento'}</button>
        </div>
      </div>
      {modalMessage && <CouponModal coupon={coupon} message={modalMessage} onClose={() => { setModalMessage(''); setCoupon(null); }} />}
    </section>
  );
};

export default FirstPurchaseBanner;
