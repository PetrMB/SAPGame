# 🏆 Globální žebříček - Návod k nastavení

Hra SAP GCC nyní podporuje **globální žebříček** pomocí Firebase Realtime Database. Bez nastavení funguje lokální žebříček (uložený v prohlížeči).

## 🚀 Rychlý start (5 minut)

### 1. Vytvoř Firebase projekt (zdarma)

1. Jdi na [Firebase Console](https://console.firebase.google.com/)
2. Klikni na **"Add project"** nebo **"Přidat projekt"**
3. Zadej název projektu (např. "SAP-GCC-Game")
4. Google Analytics můžeš vypnout (není potřeba)
5. Klikni **"Create project"**

### 2. Přidej Realtime Database

1. V levém menu klikni na **"Realtime Database"** nebo **"Databáze v reálném čase"**
2. Klikni na **"Create Database"** / **"Vytvořit databázi"**
3. Vyber region (např. europe-west1)
4. Zvol **"Start in test mode"** (spustit v testovacím režimu)
5. Klikni **"Enable"**

### 3. Nastav pravidla zabezpečení

1. V Realtime Database klikni na záložku **"Rules"** / **"Pravidla"**
2. Nahraď obsah tímto:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": true,
      ".indexOn": "score"
    }
  }
}
```

3. Klikni **"Publish"** / **"Publikovat"**

⚠️ **Poznámka:** Toto nastavení umožňuje všem číst a zapisovat do žebříčku. Pro hru to je v pořádku, ale pro citlivá data by bylo potřeba autentifikaci.

### 4. Získej konfigurační údaje

1. V levém menu klikni na ⚙️ **Settings** → **Project settings** / **Nastavení projektu**
2. Scrolluj dolů k sekci **"Your apps"** / **"Vaše aplikace"**
3. Pokud nemáš aplikaci, klikni na ikonu **"</>"** (Web)
4. Zadej název (např. "SAP GCC Web")
5. Klikni **"Register app"** / **"Zaregistrovat aplikaci"**
6. Zkopíruj hodnoty z `firebaseConfig`

### 5. Aktualizuj konfiguraci

Otevři soubor `firebase-config.js` a:

1. Změň `USE_FIREBASE` na `true`
2. Vyplň své hodnoty do `firebaseConfig`:

```javascript
const USE_FIREBASE = true; // ✅ Změň na true

const firebaseConfig = {
    apiKey: "AIzaSy...",              // Zkopíruj z Firebase Console
    authDomain: "tvuj-projekt.firebaseapp.com",
    databaseURL: "https://tvuj-projekt-default-rtdb.firebaseio.com",
    projectId: "tvuj-projekt",
    storageBucket: "tvuj-projekt.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc..."
};
```

3. Ulož soubor

### 6. Hotovo! 🎉

Otevři `index.html` v prohlížeči. Žebříček je nyní globální a všichni hráči budou vidět stejné výsledky!

## 🔍 Jak to funguje

- **S Firebase:** Žebříček se ukládá do cloudu, všichni vidí stejné výsledky (až 50 nejlepších)
- **Bez Firebase:** Žebříček se ukládá do localStorage, každý prohlížeč má své vlastní výsledky (top 10)

## 📊 Kontrola dat

V Firebase Console můžeš sledovat data v reálném čase:
1. Jdi do **Realtime Database**
2. Uvidíš sekci `leaderboard` se všemi výsledky
3. Data můžeš ručně upravovat nebo mazat

## 🔒 Zabezpečení (volitelné)

Pokud chceš omezit zápis (např. limit počtu záznamů na IP):

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      ".write": "data.child('score').val() < newData.child('score').val() || !data.exists()",
      ".indexOn": "score",
      ".validate": {
        "name": { ".validate": "newData.isString() && newData.val().length <= 10" },
        "score": { ".validate": "newData.isNumber()" },
        "resolved": { ".validate": "newData.isNumber()" },
        "time": { ".validate": "newData.isString()" },
        "date": { ".validate": "newData.isString()" }
      }
    }
  }
}
```

## ❓ Problémy?

- **"Firebase is not defined"**: Zkontroluj, že máš správně připojený Firebase SDK v `index.html`
- **"Permission denied"**: Zkontroluj pravidla v Realtime Database
- **Žebříček se nenačítá**: Otevři konzoli (F12) a podívej se na chybové hlášky

## 💰 Cena

Firebase má **štědrý free tier**:
- 1 GB uložených dat
- 10 GB/měsíc download
- 50,000 současných připojení

Pro malou hru je to zdarma! 🎮

---

**Vytvořil:** Claude Code
**Poslední aktualizace:** 2025-11-11
