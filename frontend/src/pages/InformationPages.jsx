import { ArrowRight, CheckCircle2, ChevronDown, CreditCard, Headphones, Package, ShieldCheck, SlidersHorizontal, Sparkles, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import logoStore from '../assets/logof.png';

const pageClass = 'min-h-screen bg-[#F8FAFC] pt-28 font-[\'Montserrat\'] text-slate-800';

const PageShell = ({ children }) => (
  <main className={pageClass}>
    <Navbar />
    <div className="mx-auto max-w-6xl px-4 pb-20 md:px-8">{children}</div>
    <Footer />
  </main>
);

const Intro = ({ eyebrow = 'FIRSTPC', title, children }) => (
  <div className="mx-auto max-w-3xl pb-10 pt-8 text-center">
    <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-500">{eyebrow}</p>
    <h1 className="mt-3 px-1 text-3xl font-black leading-[1.12] tracking-tight text-slate-900 md:text-5xl">{title}</h1>
    <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500">{children}</p>
  </div>
);

const Card = ({ icon: Icon, title, children }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] md:p-8">
    {Icon && <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500"><Icon size={22} /></div>}
    <h2 className="mt-5 text-xl font-black text-slate-900">{title}</h2>
    <div className="mt-3 text-sm font-medium leading-7 text-slate-500">{children}</div>
  </article>
);

export const AboutPage = () => (
  <PageShell>
    <Intro eyebrow="Conócenos" title="Tecnología para construir lo que imaginas">
      En FIRSTPC te ayudamos a encontrar el equipo y los componentes ideales para estudiar, trabajar, crear o jugar.
    </Intro>
    <section className="mx-auto grid max-w-5xl items-center gap-8 rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:grid-cols-[0.7fr_1.3fr] md:p-12">
      <div className="flex justify-center rounded-3xl bg-emerald-50 p-10"><img src={logoStore} alt="Logo de FIRSTPC" className="h-36 w-auto object-contain" /></div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">Tu tienda de hardware en México</h2>
        <p className="mt-4 text-sm font-medium leading-7 text-slate-500">Somos una tienda enfocada en computación, componentes y equipos armados. Nuestro objetivo es hacer más sencilla la elección de tecnología con recomendaciones claras, atención cercana y opciones para distintos presupuestos.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {['Catálogo de componentes', 'Recomendaciones personalizadas', 'Compra segura', 'Atención desde Campeche'].map((item) => <p key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700"><CheckCircle2 size={17} className="shrink-0 text-emerald-500" />{item}</p>)}
        </div>
      </div>
    </section>
  </PageShell>
);

export const PaymentShippingPage = () => (
  <PageShell>
    <Intro eyebrow="Compra segura" title="Formas de pago y envío">Elige la forma de pago que prefieras y recibe tu compra con paqueterías confiables en México.</Intro>
    <div className="grid gap-6 md:grid-cols-2">
      <Card icon={CreditCard} title="Formas de pago"><p>Aceptamos pagos con tarjeta mediante Visa, Mastercard y PayPal. También puedes elegir OXXO Pay para pagar en efectivo.</p><p className="mt-3">El pedido se procesa cuando el pago ha sido confirmado.</p></Card>
      <Card icon={Truck} title="Formas de envío"><p>Enviamos mediante Estafeta y DHL Express, según la cobertura y la opción disponible para tu domicilio.</p><p className="mt-3">Durante el checkout podrás revisar la paquetería y el costo antes de confirmar tu pedido.</p></Card>
      <Card icon={ShieldCheck} title="Compra protegida"><p>Tus datos se manejan de forma segura y recibirás la confirmación de tu pedido al finalizar la compra.</p></Card>
      <Card icon={Package} title="Seguimiento"><p>Conserva tu número de pedido y revisa el estado de tu compra desde tu perfil. Si necesitas ayuda, escríbenos.</p></Card>
    </div>
  </PageShell>
);

export const HowToBuyPage = () => (
  <PageShell>
    <Intro eyebrow="Compra en línea" title="¿Cómo comprar?">Completa tu compra en pocos pasos y encuentra el equipo adecuado para ti.</Intro>
    <div className="grid gap-5 md:grid-cols-2">
      {[
        ['01', 'Explora el catálogo', 'Busca componentes, laptops o equipos armados. Puedes usar el catálogo o pedir una recomendación.'],
        ['02', 'Agrega tus productos', 'Revisa el precio, la disponibilidad y las características antes de agregarlos al carrito.'],
        ['03', 'Completa tus datos', 'Inicia sesión o crea una cuenta y registra la dirección donde quieres recibir tu pedido.'],
        ['04', 'Elige pago y envío', 'Selecciona el método de pago y la paquetería disponible para tu domicilio.'],
        ['05', 'Confirma tu pedido', 'Verifica el resumen final y confirma. Recibirás los detalles de tu compra.'],
        ['06', 'Recibe tu compra', 'Da seguimiento a tu pedido y contáctanos si necesitas apoyo durante el proceso.'],
      ].map(([number, title, text]) => <article key={number} className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"><span className="text-2xl font-black text-emerald-500">{number}</span><div><h2 className="text-lg font-black text-slate-900">{title}</h2><p className="mt-2 text-sm font-medium leading-6 text-slate-500">{text}</p></div></article>)}
    </div>
    <div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/catalogo" className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Ver catálogo</Link><Link to="/recomendador" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600">Pedir recomendación</Link></div>
  </PageShell>
);

const faqs = [
  ['¿Necesito una cuenta para comprar?', 'Sí. Crear una cuenta nos permite guardar tus datos de envío y mostrarte tu historial de pedidos.'],
  ['¿Qué paqueterías utilizan?', 'Trabajamos con Estafeta y DHL Express, dependiendo de la cobertura y la opción disponible para tu dirección.'],
  ['¿Puedo solicitar ayuda para elegir componentes?', 'Sí. Usa nuestro recomendador o escríbenos desde la sección de soporte con tu presupuesto y el uso que le darás al equipo.'],
  ['¿Qué hago si mi pedido presenta un problema?', 'Conserva tu número de pedido y contáctanos desde Soporte para revisar tu caso y orientarte con la garantía o devolución.'],
  ['¿Cuánto tarda en llegar mi pedido?', 'El tiempo depende de la paquetería, la cobertura y la confirmación del pago. La opción disponible se muestra antes de finalizar la compra.'],
];

export const FAQPage = () => (
  <PageShell>
    <Intro eyebrow="Ayuda" title="Preguntas frecuentes">Encuentra respuestas rápidas sobre tus compras, envíos y recomendaciones en FIRSTPC.</Intro>
    <section className="mx-auto max-w-4xl divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      {faqs.map(([question, answer]) => <details key={question} className="group p-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black text-slate-800"><span>{question}</span><ChevronDown size={18} className="shrink-0 text-emerald-500 transition group-open:rotate-180" /></summary><p className="mt-4 pr-8 text-sm font-medium leading-7 text-slate-500">{answer}</p></details>)}
    </section>
  </PageShell>
);

const GuideStep = ({ number, title, children }) => (
  <article className="flex gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-black text-emerald-600">{number}</span>
    <div><h2 className="text-lg font-black text-slate-900">{title}</h2><p className="mt-2 text-sm font-medium leading-7 text-slate-500">{children}</p></div>
  </article>
);

export const PCBuilderGuidePage = () => (
  <PageShell>
    <Intro eyebrow="Guía de uso" title="Arma tu PC paso a paso">El PC Builder te permite elegir componentes compatibles y crear una configuración a tu medida.</Intro>
    <div className="mb-8 grid gap-6 md:grid-cols-2">
      <Card icon={SlidersHorizontal} title="¿Cómo funciona?"><p>Seleccionas los componentes principales de tu computadora: procesador, tarjeta madre, memoria RAM, almacenamiento, tarjeta gráfica, gabinete y fuente de poder.</p><p className="mt-3">La herramienta mantiene tu configuración organizada y calcula el total para que puedas revisar tu equipo antes de comprarlo.</p></Card>
      <Card icon={CheckCircle2} title="¿Qué obtienes?"><p>Al terminar tendrás una lista completa de componentes, el precio total y la opción de agregar la configuración al carrito o guardarla en tu perfil.</p></Card>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <GuideStep number="1" title="Elige el procesador">Comienza con el componente que define la plataforma de tu PC. A partir de él podrás seleccionar piezas compatibles.</GuideStep>
      <GuideStep number="2" title="Completa los componentes">Selecciona memoria, almacenamiento, gráficos, gabinete y fuente de poder según el uso y presupuesto de tu equipo.</GuideStep>
      <GuideStep number="3" title="Revisa tu configuración">Comprueba las piezas elegidas, el stock y el total. Si algo no está disponible, puedes cambiarlo antes de continuar.</GuideStep>
      <GuideStep number="4" title="Agrega al carrito">Cuando estés conforme, agrega tu PC al carrito y continúa con tus datos de envío, pago y entrega.</GuideStep>
    </div>
    <div className="mt-8 flex justify-center"><Link to="/armar-pc" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Abrir PC Builder <ArrowRight size={17} /></Link></div>
  </PageShell>
);

export const RecommendationGuidePage = () => (
  <PageShell>
    <Intro eyebrow="Guía de uso" title="Encuentra el equipo ideal para ti">El recomendador analiza tus necesidades y presupuesto para mostrarte opciones del catálogo que se adapten a tu objetivo.</Intro>
    <div className="mb-8 grid gap-6 md:grid-cols-2">
      <Card icon={Sparkles} title="¿Cómo funciona?"><p>Respondes tres preguntas sobre el tipo de equipo que buscas, el uso que le darás y el presupuesto máximo que tienes disponible.</p><p className="mt-3">Con esa información, FIRSTPC consulta el catálogo y prepara una recomendación personalizada.</p></Card>
      <Card icon={CheckCircle2} title="¿Qué obtienes?"><p>Recibes una selección de productos o una configuración sugerida. Puedes agregarla al carrito o pasar al PC Builder para personalizarla.</p></Card>
    </div>
    <div className="grid gap-5 md:grid-cols-2">
      <GuideStep number="1" title="Elige tu tipo de equipo">Indica si buscas una PC de escritorio o una laptop.</GuideStep>
      <GuideStep number="2" title="Cuéntanos para qué la necesitas">Selecciona si la usarás para gaming, trabajo, escuela, edición o diseño.</GuideStep>
      <GuideStep number="3" title="Define tu presupuesto">Indica cuánto quieres invertir. El sistema buscará opciones dentro de ese límite.</GuideStep>
      <GuideStep number="4" title="Revisa y elige">Consulta los resultados, agrega la opción que te guste al carrito o vuelve a empezar con otros criterios.</GuideStep>
    </div>
    <div className="mt-8 flex justify-center"><Link to="/recomendador" className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-black text-white transition hover:bg-emerald-600">Abrir recomendador <ArrowRight size={17} /></Link></div>
  </PageShell>
);

export const WarrantyPage = () => (
  <PageShell>
    <Intro eyebrow="Soporte posventa" title="Garantías y devoluciones">Estamos para ayudarte si tu producto presenta un inconveniente.</Intro>
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2"><Card icon={ShieldCheck} title="Solicitar garantía"><p>Ten a la mano tu número de pedido, una descripción del problema y fotografías o video cuando sea necesario. Nuestro equipo revisará el caso y te indicará los siguientes pasos.</p></Card><Card icon={Headphones} title="¿Necesitas ayuda?"><p>Escríbenos desde nuestro centro de soporte para recibir atención sobre pedidos, productos, garantías o devoluciones.</p><Link to="/soporte" className="mt-4 inline-block font-black text-emerald-600 hover:text-emerald-700">Ir a soporte →</Link></Card></div>
  </PageShell>
);
