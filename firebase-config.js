const USE_FIREBASE = true; // Změň na true pro aktivaci

const firebaseConfig = {
  apiKey: "AIzaSyDKLyWM5H-crIoEtnmMNppi4gz6E_O2GKE",
  authDomain: "sap-gcc-game.firebaseapp.com",
  databaseURL: "https://sap-gcc-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sap-gcc-game",
  storageBucket: "sap-gcc-game.firebasestorage.app",
  messagingSenderId: "209180428899",
  appId: "1:209180428899:web:0ff7e349b95f75185f0656"
};

// Inicializace Firebase (pokud je povoleno)
if (USE_FIREBASE && typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase inicializováno ✓');
    } catch (error) {
        console.error('Chyba při inicializaci Firebase:', error);
    }
}
