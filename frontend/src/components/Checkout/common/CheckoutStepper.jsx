import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 1, name: 'Carrito de compras', path: '/carrito' },
  { id: 2, name: 'Elegir dirección', path: '/checkout/direccion' },
  { id: 3, name: 'Envío y pago', path: '/checkout/envio-pago' },
  { id: 4, name: 'Confirmar pedido', path: '/checkout/confirmacion' },
];

const CheckoutStepper = ({ currentStep = 1 }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-hidden border-b border-slate-100 bg-white px-4 py-5 sm:px-8 xl:px-12">
      <div className="flex w-full flex-row items-center justify-between gap-1">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isPending = step.id > currentStep;

            return (
              <div key={step.id} className="flex min-w-0 flex-1 items-center">
                <button
                  type="button"
                  onClick={() => navigate(step.path)}
                  className={`group flex w-full min-w-0 flex-col items-center rounded-full outline-none transition focus-visible:ring-4 focus-visible:ring-emerald-500/20 md:flex-row md:justify-center ${isPending ? 'opacity-60' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Ir a ${step.name}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black shadow-sm transition group-hover:scale-105 ${
                    isCompleted || isActive
                      ? 'border-emerald-500 bg-[#10B981] text-white'
                      : 'border-slate-200 bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                    {step.id}
                  </span>
                  <span className={`mt-1 max-w-[80px] text-center text-[10px] leading-tight transition sm:max-w-[120px] sm:text-xs md:ml-3 md:mt-0 md:text-sm ${
                    isCompleted
                      ? 'font-bold text-[#10B981]'
                      : isActive
                        ? 'font-black text-slate-900'
                        : 'font-medium text-slate-400 group-hover:text-slate-600'
                  }`}>
                    {step.name}
                  </span>
                </button>

                {index < steps.length - 1 && (
                  <div className={`mx-1 h-[2px] min-w-2 flex-1 transition-colors sm:mx-2 sm:min-w-4 ${step.id < currentStep ? 'bg-emerald-300' : 'bg-slate-200'}`} aria-hidden="true" />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export { steps };
export default CheckoutStepper;
