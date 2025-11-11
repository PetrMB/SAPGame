// Firebase konfigurace pro globální žebříček
// Pro aktivaci globálního žebříčku:
// 1. Jdi na https://console.firebase.google.com/
// 2. Vytvoř nový projekt (zdarma)
// 3. Přidej "Realtime Database"
// 4. V "Rules" nastav:
//    {
//      "rules": {
//        "leaderboard": {
//          ".read": true,
//          ".write": true
//        }
//      }
//    }
// 5. Zkopíruj své údaje do firebaseConfig níže
// 6. Změň USE_FIREBASE na true

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
