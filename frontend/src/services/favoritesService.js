import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';


const userRef = (userId) => doc(db, 'users', userId);

export const addFavorite = (userId, productId) =>
  setDoc(userRef(userId), { favorites: arrayUnion(productId) }, { merge: true });

export const removeFavorite = async (userId, productId) => {
  const reference = userRef(userId);
  try {
    await updateDoc(reference, { favorites: arrayRemove(productId) });
  } catch (error) {
    if (error.code !== 'not-found') throw error;
  }
};

export const isFavorite = (favoriteIds, productId) => favoriteIds.includes(productId);

export const subscribeToFavorites = (userId, onChange, onError) =>
  onSnapshot(userRef(userId), (snapshot) => {
    onChange(snapshot.exists() && Array.isArray(snapshot.data().favorites) ? snapshot.data().favorites : []);
  }, onError);
