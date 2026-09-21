import { initializeApp } from "firebase/app"

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth"

import {
  getFirestore,
} from "firebase/firestore"

const firebaseConfig = {
  apiKey:
    "AIzaSyA5epgHx9T-0B4q4pvO58EqoH3ICrV_MWE",

  authDomain:
    "piratascampeche.firebaseapp.com",

  projectId:
    "piratascampeche",

  storageBucket:
    "piratascampeche.firebasestorage.app",

  messagingSenderId:
    "95933157947",

  appId:
    "1:95933157947:web:fb1cc0b66e515d80a7021e",
}

const app =
  initializeApp(firebaseConfig)

export const auth =
  getAuth(app)

export const db =
  getFirestore(app)

export const googleProvider =
  new GoogleAuthProvider()

export default app