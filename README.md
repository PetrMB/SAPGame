# 🏢 SAP GCC - Incident Resolution Arcade

Vizuálně atraktivní arkádová plošinovka věnovaná SAP vývoji! Staň se SAP konzultantem a řeš incidenty v celé budově Global Competence Center.

## 🎮 O Hře

SAP GCC je dynamická arkádová hra, kde hraješ za IT konzultanta v kravatě, který musí řešit incidenty napříč celou kancelářskou budovou. Tvá energie klesá a musíš ji doplňovat kávou z kávovarů rozmístěných po budově, zatímco řešíš urgentní problémy.

## ✨ Hlavní Funkce

- **🏃 Dynamický Gameplay**: Pohybuj se mezi 6 patry budovy pomocí výtahů
- **🐛 Různé Typy Incidentů**:
  - 🔥 CRITICAL - 5 sekund, 100 bodů
  - ⚠️ HIGH - 3 sekundy, 50 bodů
  - 🐛 MEDIUM - 2 sekundy, 30 bodů
  - 📝 LOW - 1 sekunda, 10 bodů
- **⚡ Energetický Systém**: Tvá energie klesá - nenech ji klesnout na nulu!
- **☕ Kávovary**: Doplň energii kávou rozmístěnou po budově
- **🎨 Vizuálně Atraktivní Design**: Moderní grafika s gradientními efekty a animacemi
- **✨ Částicové Efekty**: Vizuální feedback při každé akci

## 🎯 Jak Hrát

### Ovládání:
- **←/→** - Pohyb doleva/doprava
- **↑/↓** - Jízda výtahem nahoru/dolů (pouze když stojíš u výtahu)
- **MEZERNÍK** - Řešení incidentu / Doplnění kávy

### Cíl:
1. Pohybuj se po budově a hledej incidenty (barevné ikony s emoji)
2. Postav se k incidentu a stiskni MEZERNÍK pro zahájení řešení
3. Počkej, než se dokončí progress bar
4. Získej body podle náročnosti incidentu
5. Doplňuj energii u kávovarů ☕
6. Snaž se vyřešit co nejvíce incidentů, než ti dojde energie!

### Tipy:
- 🎯 CRITICAL incidenty dávají nejvíce bodů, ale trvají nejdéle
- ☕ Kávovar se po použití deaktivuje na 10 sekund
- ⚡ Řešení incidentů spotřebovává energii 2x rychleji
- 🏃 Plánuj si trasu efektivně - výtahy jsou jen na krajích budovy

## 🚀 Spuštění

### Lokálně:
1. Stáhni všechny soubory
2. Otevři `index.html` v moderním webovém prohlížeči
3. Klikni na tlačítko "Start"
4. Užij si hru!

### Požadavky:
- Moderní webový prohlížeč s podporou HTML5 Canvas
- JavaScript musí být povolen
- Doporučeno: Chrome, Firefox, Edge, Safari

## 📁 Struktura Projektu

```
SAPGame/
│
├── index.html      # Hlavní HTML soubor s UI
├── style.css       # Styly a vizuální design
├── game.js         # Herní logika a engine
└── README.md       # Tento soubor
```

## 🎨 Technické Detaily

### Použité Technologie:
- **HTML5 Canvas** - Vykreslování hry
- **JavaScript ES6** - Herní logika
- **CSS3** - Moderní styly a animace

### Herní Features:
- Realistická fyzika a kolize
- Plynulé animace 60 FPS
- Částicový systém pro efekty
- Responzivní UI
- Dynamické generování incidentů
- Energetický management systém

## 🏆 Skórovací Systém

- **LOW**: 10 bodů (1 sekunda)
- **MEDIUM**: 30 bodů (2 sekundy)
- **HIGH**: 50 bodů (3 sekundy)
- **CRITICAL**: 100 bodů (5 sekund)

Bonus: Čím rychleji řešíš incidenty, tím více jich můžeš vyřešit!

## 🎯 Herní Mechaniky

### Energie:
- Začínáš se 100% energie
- Energie klesá konstantně (0.05/frame)
- Při řešení incidentu klesá 2x rychleji
- Káva doplní +30 energie
- Hra končí při 0% energie

### Incidenty:
- Maximálně 5 současně aktivních incidentů
- Nové incidenty se generují každých 5 sekund
- Náhodné pozice a typy
- Vizuální pulsující efekt

### Výtahy:
- 2 výtahy na krajích budovy
- Instantní přesun mezi patry
- Dostupné pouze při stání u výtahu

## 🎨 Vizuální Prvky

- **Gradientní pozadí**: Moderní barevné přechody
- **Animované okna**: Dynamicky se rozsvěcující okna v budově
- **Částicové efekty**: Při každé akci
- **Pulsující incidenty**: Vizuální upozornění
- **Animovaný hráč**: Pohybující se nohy při chůzi
- **Progress bary**: Sledování řešení incidentů

## 📝 Budoucí Vylepšení

Možné budoucí přídavky:
- 🏅 Leaderboard systém
- 🎵 Zvukové efekty a hudba
- 🌟 Power-upy a bonusy
- 📊 Detailní statistiky
- 🎭 Různé postavy
- 🏢 Více typů budov

## 👨‍💻 Autor

Vytvořeno s ❤️ pro SAP vývojářskou komunitu

## 📄 Licence

Free to use and modify!

---

**Užij si řešení incidentů v SAP GCC! 🎮☕🏢**
