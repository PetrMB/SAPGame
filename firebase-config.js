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

const USE_FIREBASE = false; // Změň na true pro aktivaci

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
