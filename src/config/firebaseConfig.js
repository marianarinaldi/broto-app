import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB8X_3zibbJpjlmboSq2NHmrkdlVC3_MLc',
  authDomain: 'broto-app-287bc.firebaseapp.com',
  projectId: 'broto-app-287bc',
  storageBucket: 'broto-app-287bc.firebasestorage.app',
  messagingSenderId: '1004341379472',
  appId: '1:1004341379472:web:7fe6e2d1886c44a7423315',
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false,
});
