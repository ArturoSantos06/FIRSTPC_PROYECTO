import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebaseConfig';

export const DEFAULT_CATEGORIES = [
  { name: 'Procesadores', slug: 'procesadores', imageKey: 'cpu', displayOrder: 1 },
  { name: 'Tarjetas de Video', slug: 'tarjetas-de-video', imageKey: 'gpu', displayOrder: 2 },
  { name: 'Tarjetas Madre', slug: 'tarjetas-madre', imageKey: 'motherboard', displayOrder: 3 },
  { name: 'Gabinetes', slug: 'gabinetes', imageKey: 'case', displayOrder: 4 },
  { name: 'Enfriamiento', slug: 'enfriamiento', imageKey: 'cooling', displayOrder: 5 },
  { name: 'Memorias RAM', slug: 'memorias-ram', imageKey: 'ram', displayOrder: 6 },
  { name: 'Almacenamiento', slug: 'almacenamiento', imageKey: 'ssd', displayOrder: 7 },
  { name: 'Fuentes de Poder', slug: 'fuentes-de-poder', imageKey: 'psu', displayOrder: 8 },
  { name: 'Monitores', slug: 'monitores', imageKey: 'monitor', displayOrder: 9 },
  { name: 'Computadora', slug: 'computadora', imageKey: 'computadora', displayOrder: 10 },
  { name: 'Teclados', slug: 'teclados', imageKey: 'peripherals', displayOrder: 11 },
  { name: 'Mouses', slug: 'mouses', imageKey: 'peripherals', displayOrder: 12 },
  { name: 'Audífonos Gaming', slug: 'audifonos-gaming', imageKey: 'audio', displayOrder: 13 },
];

const categoriesRef = collection(db, 'categories');

export const subscribeToCategories = (onChange, onError) => onSnapshot(
  categoriesRef,
  (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))),
  onError,
);

export const saveCategory = async (category) => {
  const data = {
    name: category.name.trim(),
    slug: category.slug.trim().toLowerCase(),
    imageKey: category.imageKey || 'cpu',
    imageUrl: category.imageUrl?.trim() || '',
    displayOrder: Number(category.displayOrder) || 0,
    updatedAt: serverTimestamp(),
  };

  if (category.id) {
    await setDoc(doc(db, 'categories', category.id), data, { merge: true });
    return category.id;
  }

  const created = await addDoc(categoriesRef, { ...data, createdAt: serverTimestamp() });
  return created.id;
};

export const removeCategory = (categoryId) => deleteDoc(doc(db, 'categories', categoryId));

export const uploadCategoryImage = async (file, slug) => {
  const extension = file.name.split('.').pop().toLowerCase();
  const imageRef = ref(storage, `categories/${slug}-${Date.now()}.${extension}`);
  const uploaded = await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(uploaded.ref);
};

export const seedDefaultCategories = async () => {
  await Promise.all(DEFAULT_CATEGORIES.map((category) => setDoc(doc(db, 'categories', category.slug), {
    ...category,
    imageUrl: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })));
};
