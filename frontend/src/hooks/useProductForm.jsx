import { useState, useEffect, useRef } from 'react';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '/src/firebaseConfig.js';

const DEFAULT_STATE = { name: '', brand: '', category: 'procesadores', price: '', stock: '', description: '', image: '' };

const buildUniqueImagePath = (file) => {
  const ext = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
  return `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
};

export const useProductForm = (initialProduct, isOpen, onClose, onActionSuccess) => {
  const [formData, setFormData] = useState(DEFAULT_STATE);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const isEditMode = !!initialProduct;

  useEffect(() => {
    if (isOpen) {
      setFormData(initialProduct || DEFAULT_STATE);
      setImagePreview(initialProduct?.image || '');
      setSelectedImageFile(null);
      setErrorMessage('');
    }
  }, [isOpen, initialProduct]);

  useEffect(() => {
    if (!selectedImageFile) return;
    const previewUrl = URL.createObjectURL(selectedImageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImageFile]);

  const resetForm = () => {
    setFormData(DEFAULT_STATE);
    setSelectedImageFile(null);
    setImagePreview('');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setSelectedImageFile(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setSelectedImageFile(null);
      setErrorMessage('Selecciona una imagen válida.');
      event.target.value = '';
      return;
    }
    setErrorMessage('');
    setSelectedImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (!isEditMode && !selectedImageFile) {
        throw new Error('Selecciona una imagen.');
      }

      let imageUrl = formData.image;
      if (selectedImageFile) {
        const storageReference = ref(storage, buildUniqueImagePath(selectedImageFile));
        await uploadBytes(storageReference, selectedImageFile);
        imageUrl = await getDownloadURL(storageReference);
      }

      const dataToSave = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: imageUrl,
        description: formData.description?.trim() || ''
      };

      if (isEditMode) {
        await updateDoc(doc(db, "products", initialProduct.id), dataToSave);
      } else {
        await addDoc(collection(db, "products"), dataToSave);
      }

      if (onActionSuccess) onActionSuccess();
      handleClose();
    } catch (error) {
      setErrorMessage(error?.message || 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return {
    formData, setFormData,
    imagePreview, selectedImageFile, fileInputRef,
    loading, errorMessage, isEditMode,
    handleFileChange, handleSubmit, handleClose
  };
};