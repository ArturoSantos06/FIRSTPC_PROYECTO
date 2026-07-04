import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '/src/firebaseConfig.js';

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'procesadores',
    price: '',
    stock: '',
    image: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      });
      onProductAdded();
      onClose();
      setFormData({ name: '', brand: '', category: 'procesadores', price: '', stock: '', image: '', description: '' });
    } catch (error) {
      console.error("Error al guardar el componente en Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-['Montserrat']">
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-lg p-8 relative overflow-hidden">
        <h3 className="text-xl font-black text-slate-800 mb-6">Agregar Nuevo Componente</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Nombre del producto</label>
            <input
              type="text"
              placeholder="Nombre del componente"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#10B981] focus:bg-white transition-all"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Marca</label>
              <input
                type="text"
                placeholder="Ej: AMD, ASUS, Intel"
                required
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#10B981] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#10B981] focus:bg-white transition-all"
              >
                <option value="procesadores">Procesadores</option>
                <option value="graficas">Tarjetas de Video</option>
                <option value="tarjetas madre">Tarjetas Madre</option>
                <option value="gabinetes">Gabinetes</option>
                <option value="enfriamiento">Enfriamiento</option>
                <option value="ram">Memorias RAM</option>
                <option value="almacenamiento">Almacenamiento</option>
                <option value="fuentes">Fuentes de Poder</option>
                <option value="monitores">Monitores</option>
                <option value="computadora">Computadora</option>
                <option value="perifericos">Teclados y Mouses</option>
                <option value="audio">Audífonos Gaming</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Precio ($ MXN)</label>
              <input
                type="number"
                placeholder="Precio"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#10B981] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Stock</label>
              <input
                type="number"
                placeholder="Unidades"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#10B981] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 block mb-1">Imagen del Producto</label>
            <input
              type="url"
              placeholder="URL de la imagen (Ej: https://...)"
              required
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-medium focus:outline-none focus:border-[#10B981] focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 bg-slate-100 text-slate-600 font-bold text-sm rounded-full transition hover:bg-slate-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-3 bg-[#10B981] text-white font-bold text-sm rounded-full transition hover:bg-emerald-600 shadow-[0_4px_14px_rgba(16,185,129,0.25)] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Guardar en DB'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;