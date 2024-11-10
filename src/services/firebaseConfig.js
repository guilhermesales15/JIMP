import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAm8Je6hu9GWMy8ff7YMWgo4HyLR_hz_p0",
  authDomain: "databaseprojeto-1b139.firebaseapp.com",
  projectId: "databaseprojeto-1b139",
  storageBucket: "databaseprojeto-1b139.appspot.com",
  messagingSenderId: "869642337769",
  appId: "1:869642337769:web:b1d984af5b530bb5051f78"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
