import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getFirestore,
  runTransaction,
} from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(
  app,
  process.env.NEXT_PUBLIC_FIREBASE_DB_ID || ""
);
export const auth = getAuth(app);

// Collection references
export const ordersCollection = collection(db, "orders");
export const orderProductsCollection = collection(db, "orderProducts");
export const counterCollection = collection(db, "counters");

// Generate order number
export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr =
    today.getFullYear().toString() +
    (today.getMonth() + 1).toString().padStart(2, "0") +
    today.getDate().toString().padStart(2, "0");

  const counterRef = doc(counterCollection, "orders");

  try {
    // Use transaction to ensure atomic update
    const newCounter = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      let newCount = 1;
      if (counterDoc.exists()) {
        const data = counterDoc.data();
        // If date is the same, increment counter, otherwise reset to 1
        if (data.date === dateStr) {
          newCount = data.count + 1;
        }
      }

      transaction.set(counterRef, { count: newCount, date: dateStr });
      return newCount;
    });

    return `INV${dateStr}-${newCounter.toString().padStart(3, "0")}`;
  } catch (error) {
    console.error("Error generating order number:", error);
    throw error;
  }
}
