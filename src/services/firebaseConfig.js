import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_KEY } from '@env';


const firebaseConfig = {
  apiKey: API_KEY,
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
