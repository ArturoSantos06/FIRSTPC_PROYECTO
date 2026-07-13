import CheckoutStepper from './CheckoutStepper';

const CheckoutLayout = ({
  currentStep,
  title,
  description,
  summary,
  children,
  headerExtra,
}) => (
  <section className="w-full font-['Montserrat']">
    <div className="grid grid-cols-1 items-start gap-6 w-full max-w-7xl mx-auto px-4 xl:grid-cols-[1fr_340px] xl:gap-8">
      <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
        <CheckoutStepper currentStep={currentStep} />

        <div className="border-b border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.34em] text-emerald-500">FIRSTPC Checkout</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
            </div>
            {headerExtra}
          </div>
        </div>

        <div className="pt-8">{children}</div>
      </div>

      {summary}
    </div>
  </section>
);

export default CheckoutLayout;
