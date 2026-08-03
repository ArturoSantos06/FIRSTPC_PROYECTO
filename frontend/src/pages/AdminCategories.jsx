import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Home/Footer';
import { DeleteIcon as Trash2, EditIcon as Pencil } from '../components/icons/AppIcons';
import { removeCategory, saveCategory, seedDefaultCategories, subscribeToCategories, uploadCategoryImage } from '../services/categoryService';

const EMPTY_CATEGORY = { name: '', slug: '', imageKey: 'cpu', imageUrl: '', displayOrder: 0 };
const IMAGE_KEYS = ['cpu', 'gpu', 'motherboard', 'case', 'cooling', 'ram', 'ssd', 'psu', 'monitor', 'computadora', 'peripherals', 'audio'];
const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:bg-white';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [imageFile, setImageFile] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => subscribeToCategories(
    (items) => { setCategories(items); setLoading(false); },
    (reason) => { console.error(reason); setError('No se pudieron cargar las categorías.'); setLoading(false); },
  ), []);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const edit = (category) => { setForm({ ...EMPTY_CATEGORY, ...category }); setImageFile(null); };
  const reset = () => { setForm(EMPTY_CATEGORY); setImageFile(null); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) { setError('El nombre y el slug son obligatorios.'); return; }
    setSaving(true); setError(''); setMessage('');
    try {
      const imageUrl = imageFile ? await uploadCategoryImage(imageFile, form.slug) : form.imageUrl;
      await saveCategory({ ...form, imageUrl });
      setMessage(form.id ? 'Categoría actualizada.' : 'Categoría agregada.');
      reset();
    } catch (reason) {
      console.error(reason);
      setError('No se pudo guardar la categoría. Revisa los permisos de Firebase.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (category) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await removeCategory(categoryToDelete.id);
      setMessage('Categoría eliminada.');
      if (form.id === categoryToDelete.id) reset();
      setCategoryToDelete(null);
    } catch (reason) { console.error(reason); setError('No se pudo eliminar la categoría.'); }
  };

  const handleSeed = async () => {
    setSaving(true); setError('');
    try { await seedDefaultCategories(); setMessage('Categorías iniciales cargadas.'); }
    catch (reason) { console.error(reason); setError('No se pudieron cargar las categorías iniciales.'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 pb-12 pt-40 font-['Montserrat'] md:px-8">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8">
            <button type="button" onClick={() => window.history.back()} className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"><ArrowLeft size={15} />Regresar</button>
            <p className="text-[11px] font-black uppercase tracking-[.3em] text-emerald-500">Administración</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Categorías del catálogo</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Estas categorías aparecen automáticamente en la página de inicio.</p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <form onSubmit={handleSubmit} className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between"><h2 className="font-black text-slate-900">{form.id ? 'Editar categoría' : 'Nueva categoría'}</h2>{form.id && <button type="button" onClick={reset} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>}</div>
              <label className="mb-4 block text-xs font-black text-slate-500">Nombre<input className={`${inputClass} mt-2`} value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Ej. Procesadores" /></label>
              <label className="mb-4 block text-xs font-black text-slate-500">Slug<input className={`${inputClass} mt-2`} value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="ej. procesadores" /></label>
              <label className="mb-4 block text-xs font-black text-slate-500">Imagen local<select className={`${inputClass} mt-2`} value={form.imageKey} onChange={(event) => updateField('imageKey', event.target.value)}>{IMAGE_KEYS.map((key) => <option key={key} value={key}>{key}</option>)}</select></label>
              <label className="mb-5 block text-xs font-black text-slate-500">Imagen PNG o JPG<input type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" className={`${inputClass} mt-2 cursor-pointer`} onChange={(event) => setImageFile(event.target.files?.[0] || null)} />{imageFile && <span className="mt-2 block truncate text-[11px] font-semibold text-emerald-600">Seleccionada: {imageFile.name}</span>}{form.imageUrl && !imageFile && <span className="mt-2 block text-[11px] font-semibold text-slate-400">La categoría ya tiene una imagen guardada.</span>}</label>
              <div className="flex gap-2"><button disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white disabled:opacity-60"><Save size={16} />Guardar</button><button type="button" onClick={reset} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-600">Limpiar</button></div>
              {message && <p className="mt-4 text-xs font-bold text-emerald-600">{message}</p>}{error && <p className="mt-4 text-xs font-bold text-rose-600">{error}</p>}
            </form>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="font-black text-slate-900">Categorías activas <span className="text-emerald-500">({categories.length})</span></h2>{!loading && !categories.length && <button type="button" onClick={handleSeed} disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700"><Plus size={15} />Cargar categorías actuales</button>}</div>
              {loading ? <p className="py-12 text-center text-sm font-semibold text-slate-400">Cargando...</p> : !categories.length ? <p className="py-12 text-center text-sm font-semibold text-slate-400">No hay categorías. Agrega una o carga las iniciales.</p> : <div className="divide-y divide-slate-100">{categories.map((category) => <div key={category.id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-800">{category.name}</p><p className="mt-1 text-xs font-semibold text-slate-400">/{category.slug} · {category.imageUrl ? 'imagen subida' : `imagen local: ${category.imageKey || 'cpu'}`}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => edit(category)} className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600" aria-label={`Editar ${category.name}`}><Pencil size={16} /></button><button type="button" onClick={() => handleDelete(category)} className="rounded-xl bg-rose-50 p-2 text-rose-500 hover:bg-rose-100" aria-label={`Eliminar ${category.name}`}><Trash2 size={16} /></button></div></div>)}</div>}
            </section>
          </div>
        </div>
      </main>
      <Footer />
      {categoryToDelete && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-labelledby="delete-category-title" className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.25em] text-rose-500">Confirmar eliminación</p><h2 id="delete-category-title" className="mt-2 text-xl font-black text-slate-900">¿Eliminar categoría?</h2></div><button type="button" onClick={() => setCategoryToDelete(null)} className="rounded-full bg-slate-100 px-3 py-1 text-lg font-bold text-slate-500 hover:bg-slate-200" aria-label="Cerrar">×</button></div><p className="text-sm font-medium leading-relaxed text-slate-600">La categoría <strong className="font-black text-slate-900">“{categoryToDelete.name}”</strong> dejará de mostrarse en la página de inicio.</p><div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setCategoryToDelete(null)} className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-200">Cancelar</button><button type="button" onClick={confirmDelete} className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white transition hover:bg-rose-600">Eliminar categoría</button></div></div></div>}
    </>
  );
};

export default AdminCategories;
