import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// بيانات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBy-OhVURoXuK_C-cdNMYf_Uwe3hGA88E",
  authDomain: "tomas-service.firebaseapp.com",
  projectId: "tomas-service",
  storageBucket: "tomas-service.firebasestorage.app",
  messagingSenderId: "69137587894",
  appId: "1:69137587894:web:96ccaff83928b72cb49017"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// الحصول على قاعدة البيانات
const db = getFirestore(app);

// تصدير
export { db };
console.log("✅ Firebase connected:", firebaseConfig.projectId);