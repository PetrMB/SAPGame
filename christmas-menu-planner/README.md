# 🎄 Plánovač vánočního menu

Interaktivní webová aplikace pro plánování tradičního českého vánočního menu s funkcemi pro automatické přepočítávání porcí, generování nákupního seznamu a časovou osu přípravy.

## ✨ Funkce

### 📖 Katalog receptů
- 12 tradičních českých vánočních receptů
- Kategorie: Hlavní jídla, Přílohy, Cukroví, Nápoje
- Filtrování podle kategorií
- Detailní informace o každém receptu (čas přípravy, obtížnost, ingredience, postup)

### 🍽️ Plánování menu
- Výběr libovolného množství receptů
- Nastavení počtu hostů (1-50)
- Automatický přepočet porcí podle počtu hostů
- Vizuální zobrazení vybraných receptů

### 🛒 Nákupní seznam
- Automatické generování seznamu všech ingrediencí
- Agregace stejných ingrediencí s jednotkami
- Seskupení podle kategorií (Maso, Zelenina, Trvanlivé, atd.)
- Možnost kopírování do schránky
- Možnost tisku
- Integrace s Rohlík.cz - otevře web a zkopíruje seznam

### ⏰ Časová osa přípravy
- Zpětné plánování od cílového času podávání
- Automatické seřazení receptů podle délky přípravy
- Doporučený čas pro nákup ingrediencí
- Přehledné zobrazení začátku a konce každé aktivity

## 🎨 Design

Aplikace používá tradiční vánoční barevné schéma:
- 🔴 Červená (`#c41e3a`) - hlavní prvky, tlačítka
- 🟢 Zelená (`#165b33`, `#0d3d20`) - akcenty, okraje
- ✨ Zlatá (`#ffd700`) - dekorativní prvky, zvýraznění
- ❄️ Animovaný sněhový efekt na pozadí

## 🚀 Spuštění

1. Otevřete složku `christmas-menu-planner`
2. Otevřete soubor `index.html` v prohlížeči
3. Aplikace funguje bez nutnosti serveru (čistý HTML/CSS/JS)

### Pro lokální vývoj s live reload:
```bash
# Jednoduchý HTTP server pomocí Python
python -m http.server 8000

# Nebo pomocí Node.js
npx http-server
```

Poté otevřete `http://localhost:8000` v prohlížeči.

## 📱 Responzivní design

Aplikace je plně responzivní a funguje na:
- 💻 Desktop počítačích
- 📱 Tabletech
- 📱 Mobilních telefonech

## 🍳 Zahrnuté recepty

### Hlavní jídla
- Smažený kapr
- Rybí polévka
- Kapustnice
- Vepřová pečeně

### Přílohy
- Bramborový salát
- Rybí salát

### Cukroví a pečivo
- Vanilkové rohlíčky
- Linecké cukroví
- Perníčky
- Ořechové košíčky
- Vánočka

### Nápoje
- Svařené víno

## 🔧 Technologie

- **HTML5** - Sémantická struktura
- **CSS3** - Vlastní styly, animace, gradients
- **Vanilla JavaScript (ES6+)** - Žádné externí frameworky
- **JSON** - Databáze receptů

## 📂 Struktura souborů

```
christmas-menu-planner/
├── index.html      # Hlavní HTML struktura
├── style.css       # Vánoční CSS styly
├── app.js          # Logika aplikace
├── recipes.json    # Databáze receptů
└── README.md       # Dokumentace
```

## 🎯 Jak používat

1. **Vyberte recepty**: Klikněte na recepty v katalogu, které chcete připravit
2. **Nastavte počet hostů**: Použijte +/- tlačítka nebo zadejte číslo
3. **Vygenerujte nákupní seznam**: Klikněte na "Vytvořit nákupní seznam"
   - Zkopírujte seznam nebo vytiskněte
   - Nebo jej pošlete na Rohlík.cz
4. **Zobrazit časovou osu**: Klikněte na "Zobrazit časovou osu"
   - Nastavte čas, kdy chcete mít vše hotové
   - Aplikace vám řekne, kdy začít s přípravou každého pokrmu

## 🎁 Tipy pro použití

- **Včasné plánování**: Spusťte aplikaci alespoň den předem
- **Nákup**: Využijte integraci s Rohlík.cz pro pohodlný online nákup
- **Časování**: Dodržujte časovou osu pro synchronizované dokončení všech pokrmů
- **Příprava předem**: Některé pokrmy (bramborový salát, cukroví) lze připravit den předem

## 🌟 Budoucí vylepšení

Potenciální rozšíření aplikace:
- [ ] Ukládání oblíbených menu do localStorage
- [ ] Export menu do PDF
- [ ] Přidání vlastních receptů
- [ ] Sdílení menu s rodinou
- [ ] Kalkulace nákladů
- [ ] Nutriční hodnoty
- [ ] Video návody na přípravu

## 📝 Licence

Tento projekt je vytvořen pro vzdělávací účely a volné použití.

## 🎅 Veselé Vánoce!

Přejeme vám krásné svátky a úspěšnou přípravu vánočního menu! 🎄✨
