import { collection, doc, getDoc, getDocs, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const COUPON_COLLECTION = 'welcomeCoupons';
const DISCOUNT_RATE = 0.10;

const generateCode = () => {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FIRST10-${randomPart}`;
};

export const getOrCreateWelcomeCoupon = async ({ userId, email }) => {
  if (!userId) throw new Error('LOGIN_REQUIRED');

  let existingOrders;
  try {
    existingOrders = await getDocs(query(collection(db, 'orders'), where('userId', '==', userId)));
  } catch (error) {
    console.error('No se pudo comprobar el historial para el cupón:', error);
    if (error?.code === 'permission-denied') throw new Error('COUPON_PERMISSION');
    throw error;
  }
  if (!existingOrders.empty) throw new Error('WELCOME_COUPON_NOT_AVAILABLE');

  const couponReference = doc(db, COUPON_COLLECTION, userId);
  let coupon;

  try {
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(couponReference);
      if (snapshot.exists()) {
        coupon = { id: snapshot.id, ...snapshot.data() };
        return;
      }

      const code = generateCode();
      const couponData = {
        code,
        userId,
        email: email || '',
        discountRate: DISCOUNT_RATE,
        status: 'active',
        createdAt: serverTimestamp(),
      };
      transaction.set(couponReference, couponData);
      coupon = { id: couponReference.id, ...couponData };
    });
  } catch (error) {
    console.error('No se pudo crear el cupón de bienvenida:', error);
    if (error?.code === 'permission-denied') throw new Error('COUPON_PERMISSION');
    throw error;
  }

  return coupon;
};

export const getCouponForUser = async (userId) => {
  if (!userId) return null;
  const couponReference = doc(db, COUPON_COLLECTION, userId);
  const snapshot = await getDoc(couponReference);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export { DISCOUNT_RATE };
