/* Konfigurasi Firebase ThermoLab Challenge.
   apiKey ini AMAN untuk ditaruh di kode frontend (publik) — bukan password.
   Keamanan sesungguhnya diatur lewat Firestore Security Rules di Firebase console. */
const firebaseConfig = {
  apiKey: "AIzaSyDf26PmDhDPfjOMESEf-8-OsnQdQ4X0PJs",
  authDomain: "thermolab-challenge.firebaseapp.com",
  projectId: "thermolab-challenge",
  storageBucket: "thermolab-challenge.firebasestorage.app",
  messagingSenderId: "460631112024",
  appId: "1:460631112024:web:335f6a1d6080ea1ec60d2d"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
