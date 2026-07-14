import { useEffect, useRef, useState } from 'react';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

const EMPTY_FORM = {
  name: '', brand: '', sku: '', category: 'procesadores', price: '', stock: '',
  brandAboutText: '', descriptionTitle: '', descriptionContent: '',
};

const generateSku = () => `FPC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const normalizeRows = (object = {}) => Object.entries(object).map(([key, value]) => ({ key, value: String(value ?? '') }));
const normalizeFullSpecs = (object = {}) => Object.entries(object).map(([category, values]) => ({ category, fields: normalizeRows(values) }));

const createStoragePath = (file, prefix) => {
  const extension = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
  return `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
};

const getBrandLogoUrl = async (brand) => {
  const cleanBrand = brand.trim();
  const exactReference = ref(storage, `brands/${cleanBrand}.png`);

  try {
    return await getDownloadURL(exactReference);
  } catch (error) {
    if (error?.code !== 'storage/object-not-found') throw error;
  }

  const normalizedBrand = cleanBrand.toLowerCase();
  const brandsReference = ref(storage, 'brands');
  const brandFiles = await listAll(brandsReference);
  const logoReference = brandFiles.items.find(
    (item) => item.name.toLowerCase() === `${normalizedBrand}.png`,
  );

  if (!logoReference) throw Object.assign(new Error(`No se encontró el logo brands/${cleanBrand}.png en Firebase Storage.`), { code: 'storage/object-not-found' });
  return getDownloadURL(logoReference);
};

const createInitialState = (product) => ({
  ...EMPTY_FORM,
  sku: product?.sku || generateSku(),
  ...(product ? {
    name: product.name || '', brand: product.brand || '', category: product.category || 'procesadores',
    price: product.price ?? '', stock: product.stock ?? '', brandAboutText: product.brandAboutText || '',
    descriptionTitle: product.description?.title || '', descriptionContent: product.description?.content || product.description?.intro || product.description || '',
  } : {}),
});

export const useAdvancedProductForm = (initialProduct, isOpen, onClose, onActionSuccess, user) => {
  const [formData, setFormData] = useState(() => createInitialState(initialProduct));
  const [keySpecRows, setKeySpecRows] = useState(() => normalizeRows(initialProduct?.keySpecs));
  const [fullSpecRows, setFullSpecRows] = useState(() => normalizeFullSpecs(initialProduct?.fullSpecs));
  const [existingImages, setExistingImages] = useState(() => initialProduct?.images || (initialProduct?.image ? [initialProduct.image] : []));
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const isEditMode = Boolean(initialProduct);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(createInitialState(initialProduct));
    setKeySpecRows(normalizeRows(initialProduct?.keySpecs));
    setFullSpecRows(normalizeFullSpecs(initialProduct?.fullSpecs));
    setExistingImages(initialProduct?.images || (initialProduct?.image ? [initialProduct.image] : []));
    setSelectedFiles([]); setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isOpen, initialProduct]);

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const setField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));
  const handleImagesChange = (event) => {
    const files = [...(event.target.files || [])];
    const invalid = files.find((file) => !file.type.startsWith('image/'));
    if (invalid) { setErrorMessage('Todos los archivos de galería deben ser imágenes.'); return; }
    setErrorMessage(''); setSelectedFiles(files);
  };
  const updateKeyRow = (index, field, value) => setKeySpecRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  const updateFullRow = (index, field, value) => setFullSpecRows((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  const updateFullField = (categoryIndex, fieldIndex, field, value) => setFullSpecRows((rows) => rows.map((row, rowIndex) => rowIndex === categoryIndex ? { ...row, fields: row.fields.map((item, itemIndex) => itemIndex === fieldIndex ? { ...item, [field]: value } : item) } : row));

  const uploadFile = async (file, folder) => {
    const storageReference = ref(storage, createStoragePath(file, folder));
    await uploadBytes(storageReference, file);
    return getDownloadURL(storageReference);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (user?.role !== 'admin') { setErrorMessage('No tienes permisos para guardar productos.'); return; }
    if (!formData.name.trim() || !formData.brand.trim()) { setErrorMessage('Nombre y marca son obligatorios.'); return; }
    if (Number(formData.price) < 0 || Number(formData.stock) < 0 || formData.price === '' || formData.stock === '') { setErrorMessage('Precio y stock deben ser números válidos.'); return; }
    if (!isEditMode && !selectedFiles.length) { setErrorMessage('Selecciona al menos una imagen para la galería.'); return; }
    setLoading(true); setErrorMessage('');
    try {
      const uploadedImages = await Promise.all(selectedFiles.map((file) => uploadFile(file, 'products')));
      let brandLogo = initialProduct?.brandLogo || '';
      try {
        brandLogo = await getBrandLogoUrl(formData.brand);
      } catch (error) {
        if (error?.code !== 'storage/object-not-found') throw error;
      }
      const keySpecs = Object.fromEntries(keySpecRows.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value.trim()]));
      const fullSpecs = Object.fromEntries(fullSpecRows.filter((group) => group.category.trim()).map((group) => [group.category.trim(), Object.fromEntries(group.fields.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value.trim()]))]));
      const dataToSave = {
        name: formData.name.trim(), brand: formData.brand.trim(), category: formData.category, sku: formData.sku.trim() || generateSku(), price: Number(formData.price), stock: Number(formData.stock),
        rating: Number(initialProduct?.rating) || 0, reviewsCount: Number(initialProduct?.reviewsCount) || 0, brandLogo, brandAboutText: formData.brandAboutText.trim(),
        images: [...existingImages, ...uploadedImages], description: { title: formData.descriptionTitle.trim(), content: formData.descriptionContent.trim() }, keySpecs, fullSpecs,
      };
      if (isEditMode) await updateDoc(doc(db, 'products', initialProduct.id), dataToSave);
      else await addDoc(collection(db, 'products'), dataToSave);
      onActionSuccess?.(); onClose();
    } catch (error) { console.error('Error guardando producto:', error); setErrorMessage(error?.message || 'No se pudo guardar el producto.'); }
    finally { setLoading(false); }
  };

  const removeExistingImage = (image) => setExistingImages((images) => images.filter((item) => item !== image));
  const moveItem = (items, index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return items;
    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    return reordered;
  };
  const moveExistingImage = (index, direction) => setExistingImages((images) => moveItem(images, index, direction));
  const moveSelectedFile = (index, direction) => setSelectedFiles((files) => moveItem(files, index, direction));
  const handleClose = () => { if (!loading) onClose(); };
  return { formData, setField, keySpecRows, fullSpecRows, updateKeyRow, updateFullRow, updateFullField, setKeySpecRows, setFullSpecRows, existingImages, removeExistingImage, moveExistingImage, selectedFiles, moveSelectedFile, previews, fileInputRef, handleImagesChange, handleSubmit, handleClose, loading, errorMessage, isEditMode };
};
