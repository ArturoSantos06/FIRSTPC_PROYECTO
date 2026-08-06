import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const getInitialPeriod = (value) => {
  const [year, month] = String(value || '').split('-').map(Number);
  const now = new Date();
  return {
    year: year || now.getFullYear(),
    month: month >= 1 && month <= 12 ? month : null,
  };
};

const MonthYearPicker = ({ value, onChange, ariaLabel = 'Seleccionar mes y año' }) => {
  const containerRef = useRef(null);
  const initialPeriod = getInitialPeriod(value);
  const [isOpen, setIsOpen] = useState(false);
  const [year, setYear] = useState(initialPeriod.year);

  useEffect(() => {
    const period = getInitialPeriod(value);
    setYear(period.year);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const closeOnOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [isOpen]);

  const selectedMonth = Number(String(value || '').split('-')[1]) || null;
  const selectMonth = (month) => {
    onChange(`${year}-${String(month).padStart(2, '0')}`);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button type="button" aria-label={ariaLabel} aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-white transition ${isOpen ? 'border-emerald-400 text-emerald-600 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]' : 'border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-600'}`}>
        <Calendar size={18} aria-hidden="true" />
      </button>
      {isOpen && <div className="absolute right-0 top-12 z-40 w-64 rounded-2xl border border-slate-200 bg-white p-4 font-['Montserrat'] shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3"><button type="button" onClick={() => setYear((current) => current - 1)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600" aria-label="Año anterior"><ChevronLeft size={16} /></button><span className="text-sm font-black text-slate-900">{year}</span><button type="button" onClick={() => setYear((current) => current + 1)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600" aria-label="Año siguiente"><ChevronRight size={16} /></button></div>
        <div className="mt-4 grid grid-cols-3 gap-2">{months.map((month, index) => { const monthNumber = index + 1; const isSelected = selectedMonth === monthNumber && String(value).startsWith(`${year}-`); return <button key={month} type="button" onClick={() => selectMonth(monthNumber)} className={`rounded-xl px-2 py-2.5 text-xs font-black transition ${isSelected ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'}`}>{month}</button>; })}</div>
        {value && <button type="button" onClick={() => { onChange(''); setIsOpen(false); }} className="mt-3 w-full border-t border-slate-100 pt-3 text-xs font-black text-slate-400 transition hover:text-rose-500">Limpiar filtro</button>}
      </div>}
    </div>
  );
};

export default MonthYearPicker;
