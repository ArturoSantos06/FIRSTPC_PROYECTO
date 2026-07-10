import React from 'react';

const CheckoutStepper = ({ currentStep = 1 }) => {
  return (
    <div className="border-b border-slate-100 bg-white px-6 py-5 sm:px-8">
      <div className="flex items-center justify-start overflow-x-auto pb-2 md:justify-center md:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span className="ml-3 text-sm font-bold text-[#10B981]">Carrito de compras</span>
          </div>

          <div className="mx-4 h-[2px] w-8 bg-slate-200 sm:w-12 lg:mx-6 lg:w-20"></div>

          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
              2
            </div>
            <span className="ml-3 text-sm font-bold text-slate-500">Elegir dirección</span>
          </div>

          <div className="mx-4 h-[2px] w-8 bg-slate-200 sm:w-12 lg:mx-6 lg:w-20"></div>

          <div className={`flex items-center ${currentStep < 3 ? 'opacity-50' : ''}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400">
              3
            </div>
            <span className="ml-3 text-sm font-medium text-slate-400">Envío y pago</span>
          </div>

          <div className="mx-4 h-[2px] w-8 bg-slate-200 sm:w-12 lg:mx-6 lg:w-20"></div>

          <div className={`flex items-center ${currentStep < 4 ? 'opacity-50' : ''}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-400">
              4
            </div>
            <span className="ml-3 text-sm font-medium text-slate-400">Confirmar pedido</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutStepper;