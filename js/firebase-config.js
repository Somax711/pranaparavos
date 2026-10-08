import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

 const firebaseConfig = {
    apiKey: "AIzaSyDayiySVq6ZJxAMgoAVR2mYnBzQc6e-Y8E",
    authDomain: "pranaparavos-58ab3.firebaseapp.com",
    projectId: "pranaparavos-58ab3",
    storageBucket: "pranaparavos-58ab3.firebasestorage.app",
    messagingSenderId: "986048620998",
    appId: "1:986048620998:web:fded595237b5f59f652ac7"
  };

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);