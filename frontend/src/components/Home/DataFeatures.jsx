import React from 'react';

const ShippingIcon = () => (
  <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17H6V6h11v5m-2 2l4-4m0 0l-4-4m4 4H9" /></svg>
);
const WarrantyIcon = () => (
  <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.955a12.02 12.02 0 009 3.045 12.02 12.02 0 009-3.045 12.02 12.02 0 00-1.382-8.947z" /></svg>
);
const SupportIcon = () => (
  <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const BuildIcon = () => (
  <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
);

export const featuresData = [
  {
    icon: <ShippingIcon />,
    title: "Envíos Asegurados",
    description: "Recibe tus componentes en perfecto estado, protegidos en cada paso del camino.",
  },
  {
    icon: <WarrantyIcon />,
    title: "Garantía de Hardware",
    description: "Compra con confianza. Todos nuestros productos cuentan con garantía oficial.",
  },
  {
    icon: <SupportIcon />,
    title: "Soporte Técnico",
    description: "Nuestro equipo de expertos está listo para resolver todas tus dudas.",
  },
  {
    icon: <BuildIcon />,
    title: "Armado Profesional",
    description: "Dejamos tu PC listo para la acción, con gestión de cables y pruebas de estrés.",
  },
];
