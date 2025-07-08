// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIRSCPJW5vED0CHnsHO-G_460UbUHw8DE",
  authDomain: "sport-1c460.firebaseapp.com",
  projectId: "sport-1c460",
  storageBucket: "sport-1c460.firebasestorage.app",
  messagingSenderId: "907597355527",
  appId: "1:907597355527:web:af380d1cd5d1682c1e28a2",
  measurementId: "G-PED3YNGRSV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
