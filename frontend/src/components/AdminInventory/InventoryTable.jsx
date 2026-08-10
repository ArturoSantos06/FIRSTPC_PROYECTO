/* eslint-disable react/prop-types */
import { Edit3, Package, RefreshCw } from "lucide-react";
import InventoryEditModal from "./InventoryEditModal";

const InventoryTable = ({ products, loading, getImage, getStock, money, stockState, modalProduct, setModalProduct, savingId, saveProduct }) => (
  <>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Catálogo de existencias</h2><p className="mt-0.5 text-[11px] text-slate-500">Mostrando {products.length} ítems</p></div>{loading && <RefreshCw size={17} className="animate-spin text-emerald-600" />}</div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] text-left">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black uppercase tracking-[.15em] text-slate-400"><tr><th className="px-5 py-3.5">Producto / Detalles</th><th className="px-4 py-3.5">Categoría</th><th className="px-4 py-3.5">Precio MXN</th><th className="px-4 py-3.5">Stock</th><th className="px-4 py-3.5">Estado</th><th className="px-5 py-3.5 text-right">Acción</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{!loading && products.map((product) => { const stock = getStock(product); const state = stockState(stock); const StateIcon = state.icon; return <tr key={product.id} className="group transition hover:bg-slate-50/80"><td className="px-5 py-4"><div className="flex items-center gap-3"><img src={getImage(product)} alt="" className="h-12 w-12 rounded-xl border border-slate-200 bg-white object-contain p-1 shadow-sm" /><div className="min-w-0"><p className="max-w-[280px] truncate text-xs font-bold text-slate-900 transition group-hover:text-emerald-600">{product.name || "Sin nombre"}</p><p className="mt-1 font-mono text-[10px] text-slate-400">SKU: {product.sku || "—"} <span className="mx-1 text-slate-300">•</span> MPN: {product.mpn || "—"}</p></div></div></td><td className="px-4 py-4"><span className="rounded-lg border border-slate-200/60 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">{product.category || "General"}</span></td><td className="px-4 py-4 text-xs font-black text-slate-900">{money(product.price)}</td><td className="px-4 py-4"><span className={`inline-flex min-w-12 justify-center rounded-lg border px-3 py-2 text-xs font-black ${state.badgeColor}`}>{stock}</span></td><td className="px-4 py-4"><div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${state.badgeColor}`}><StateIcon size={12} /><span>{state.label}</span></div></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setModalProduct(product)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800"><Edit3 size={13} /> Editar</button></td></tr>; })}</tbody>
        </table>
        {!loading && products.length === 0 && <div className="px-6 py-16 text-center"><Package className="mx-auto text-slate-300" size={36} /><p className="mt-3 text-sm font-bold text-slate-700">Sin resultados</p><p className="mt-1 text-xs text-slate-400">Prueba cambiando los parámetros de búsqueda.</p></div>}
      </div>
    </div>
    {modalProduct && <InventoryEditModal product={modalProduct} onClose={() => setModalProduct(null)} onSave={saveProduct} saving={savingId === modalProduct.id} />}
  </>
);

export default InventoryTable;
