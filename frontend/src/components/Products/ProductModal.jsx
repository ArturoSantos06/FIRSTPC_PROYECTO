import React from 'react';
import { useProductForm } from '../../hooks/useProductForm.jsx'; 

const CATEGORY_OPTIONS = [
  { value: 'procesadores', label: 'Procesadores' }, { value: 'graficas', label: 'Tarjetas de Video' },
  { value: 'tarjetas madre', label: 'Tarjetas Madre' }, { value: 'gabinetes', label: 'Gabinetes' },
  { value: 'enfriamiento', label: 'Enfriamiento' }, { value: 'ram', label: 'Memorias RAM' },
  { value: 'almacenamiento', label: 'Almacenamiento' }, { value: 'fuentes', label: 'Fuentes de Poder' },
  { value: 'monitores', label: 'Monitores' }, { value: 'computadora', label: 'Computadora' },
  { value: 'perifericos', label: 'Teclados y Mouses' }, { value: 'audio', label: 'Audífonos Gaming' }
];

const ProductModal = ({ isOpen, onClose, product = null, onActionSuccess }) => {
  const {
    formData, setFormData, imagePreview, fileInputRef,
    loading, errorMessage, isEditMode,
    handleFileChange, handleSubmit, handleClose
  } = useProductForm(product, isOpen, onClose, onActionSuccess);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-['Montserrat']">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-lg p-8 relative overflow-hidden">
        <h3 className="text-xl font-black text-slate-800 mb-6">
          {isEditMode ? 'Editar Componente' : 'Agregar Nuevo Componente'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Nombre</label>
            <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-[#10B981] transition-all" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Marca</label>
              <input type="text" required value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-[#10B981] transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Categoría</label>
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-[#10B981] transition-all">
                {CATEGORY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Precio</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-[#10B981] transition-all" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Stock</label>
              <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-[#10B981] transition-all" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Descripción</label>
            <textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm focus:outline-none focus:border-[#10B981] transition-all resize-none" />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Imagen</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} required={!isEditMode && !formData.image} className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm transition hover:border-[#10B981]" />
            {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 h-32 w-full object-cover rounded-2xl border border-slate-200 shadow-sm" />}
            {loading && <p className="mt-2 text-xs text-emerald-600 font-bold">Procesando...</p>}
            {errorMessage && <p className="mt-2 text-xs text-rose-600 font-bold">{errorMessage}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleClose} disabled={loading} className="w-1/2 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-full transition hover:bg-slate-200 disabled:opacity-50">Cancelar</button>
            <button type="submit" disabled={loading} className="w-1/2 py-3 bg-[#10B981] text-white font-bold text-sm rounded-full transition hover:bg-emerald-600 shadow-lg disabled:opacity-50">{loading ? 'Procesando...' : (isEditMode ? 'Actualizar' : 'Guardar')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;