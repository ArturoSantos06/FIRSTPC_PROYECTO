/* eslint-disable react/prop-types */
import { useState } from "react";
import { X } from "lucide-react";
import { getStock } from "./useAdminInventory";

const InventoryEditModal = ({ product, onClose, onSave, saving }) => {
  const [stock, setStock] = useState(String(getStock(product)));
  const [price, setPrice] = useState(String(product.price ?? ""));

  const submit = (event) => {
    event.preventDefault();
    onSave({ stock: Math.max(0, Number(stock) || 0), price: Math.max(0, Number(price) || 0) });
  };

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="mb-6 flex items-start justify-between"><div><span className="text-[10px] font-extrabold uppercase tracking-[.25em] text-emerald-600">Gestión FIRSTPC</span><h2 className="mt-1 text-xl font-bold text-slate-900">Actualizar Producto</h2><p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">{product.name}</p></div><button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar"><X size={18} /></button></div>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-wider text-slate-600">Stock<input autoFocus min="0" type="number" value={stock} onChange={(event) => setStock(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg font-black text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></label><label className="text-xs font-bold uppercase tracking-wider text-slate-600">Precio MXN<input min="0" type="number" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg font-black text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></label></div>
      <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:text-slate-900">Cancelar</button><button disabled={saving} className="rounded-xl bg-emerald-500 px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-50">{saving ? "Guardando..." : "Guardar Cambios"}</button></div>
    </form>
  </div>;
};

export default InventoryEditModal;
