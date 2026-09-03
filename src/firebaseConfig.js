import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBwITRvFtHC2yzr5N5sIbVR9T38DQ1UWAM',
  authDomain: "sut-pinpoint.firebaseapp.com",
  databaseURL: "https://sut-pinpoint-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sut-pinpoint",
  storageBucket: "sut-pinpoint.firebasestorage.app",
  messagingSenderId: "446347636879",
  appId: "1:446347636879:web:1b713566235be66a0c80fa",
  measurementId: "G-R423P25YZ8"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);