// Plánovač vánočního menu - hlavní aplikace
class ChristmasMenuPlanner {
    constructor() {
        this.recipes = [];
        this.selectedRecipes = [];
        this.guestCount = 4;
        this.currentFilter = 'all';

        this.init();
    }

    async init() {
        await this.loadRecipes();
        this.setupEventListeners();
        this.renderRecipes();
        this.updateGuestCount();
    }

    async loadRecipes() {
        try {
            const response = await fetch('recipes.json');
            const data = await response.json();
            this.recipes = data.recipes;
        } catch (error) {
            console.error('Chyba při načítání receptů:', error);
            alert('Nepodařilo se načíst recepty. Zkontrolujte, zda je soubor recipes.json dostupný.');
        }
    }

    setupEventListeners() {
        // Filtry kategorií
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.category;
                this.renderRecipes();
            });
        });

        // Počet hostů
        document.getElementById('decreaseGuests').addEventListener('click', () => {
            if (this.guestCount > 1) {
                this.guestCount--;
                this.updateGuestCount();
                this.renderSelectedRecipes();
            }
        });

        document.getElementById('increaseGuests').addEventListener('click', () => {
            if (this.guestCount < 50) {
                this.guestCount++;
                this.updateGuestCount();
                this.renderSelectedRecipes();
            }
        });

        document.getElementById('guestCount').addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 50) {
                this.guestCount = value;
                this.updateGuestCount();
                this.renderSelectedRecipes();
            } else {
                e.target.value = this.guestCount;
            }
        });

        // Akční tlačítka
        document.getElementById('generateShoppingList').addEventListener('click', () => {
            this.showShoppingList();
        });

        document.getElementById('generateTimeline').addEventListener('click', () => {
            this.showTimeline();
        });

        // Modal zavírání
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Nákupní seznam akce
        document.getElementById('printList').addEventListener('click', () => {
            window.print();
        });

        document.getElementById('copyList').addEventListener('click', () => {
            this.copyShoppingList();
        });

        document.getElementById('sendToRohlik').addEventListener('click', () => {
            this.sendToRohlik();
        });

        // Timeline
        document.getElementById('calculateTimeline').addEventListener('click', () => {
            this.renderTimeline();
        });
    }

    renderRecipes() {
        const recipeList = document.getElementById('recipeList');
        const filteredRecipes = this.currentFilter === 'all'
            ? this.recipes
            : this.recipes.filter(r => r.category === this.currentFilter);

        recipeList.innerHTML = filteredRecipes.map(recipe => `
            <div class="recipe-card ${this.isRecipeSelected(recipe.id) ? 'selected' : ''}"
                 data-recipe-id="${recipe.id}">
                <h3>${recipe.name}</h3>
                <p>${recipe.description}</p>
                <div class="recipe-meta">
                    <span>⏱️ ${recipe.prepTime + recipe.cookTime} min</span>
                    <span>👥 ${recipe.servings} porcí</span>
                    <span>📊 ${recipe.difficulty}</span>
                </div>
                <span class="category-badge">${recipe.categoryName}</span>
            </div>
        `).join('');

        // Přidání event listenerů na karty
        document.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const recipeId = parseInt(e.currentTarget.dataset.recipeId);
                this.toggleRecipe(recipeId);
            });
        });
    }

    isRecipeSelected(recipeId) {
        return this.selectedRecipes.some(r => r.id === recipeId);
    }

    toggleRecipe(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) return;

        const index = this.selectedRecipes.findIndex(r => r.id === recipeId);
        if (index >= 0) {
            this.selectedRecipes.splice(index, 1);
        } else {
            this.selectedRecipes.push(recipe);
        }

        this.renderRecipes();
        this.renderSelectedRecipes();
        this.updateActionButtons();
    }

    updateGuestCount() {
        document.getElementById('guestCount').value = this.guestCount;
    }

    renderSelectedRecipes() {
        const container = document.getElementById('selectedRecipes');

        if (this.selectedRecipes.length === 0) {
            container.innerHTML = '<p class="empty-message">Zatím jste nevybrali žádné recepty. Klikněte na recept v katalogu pro přidání.</p>';
            return;
        }

        container.innerHTML = this.selectedRecipes.map(recipe => {
            const multiplier = this.guestCount / recipe.servings;
            return `
                <div class="selected-recipe-item">
                    <button class="remove-recipe" data-recipe-id="${recipe.id}">×</button>
                    <h4>${recipe.name}</h4>
                    <div class="portion-info">
                        Originál: ${recipe.servings} porcí →
                        Upraveno: ${this.guestCount} porcí
                        (násobek: ${multiplier.toFixed(2)}×)
                    </div>
                    <div class="recipe-meta">
                        <span>⏱️ ${recipe.prepTime + recipe.cookTime} min</span>
                        <span>📊 ${recipe.difficulty}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Event listenery pro odstranění
        document.querySelectorAll('.remove-recipe').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const recipeId = parseInt(e.target.dataset.recipeId);
                this.toggleRecipe(recipeId);
            });
        });
    }

    updateActionButtons() {
        const hasRecipes = this.selectedRecipes.length > 0;
        document.getElementById('generateShoppingList').disabled = !hasRecipes;
        document.getElementById('generateTimeline').disabled = !hasRecipes;
    }

    calculateIngredients() {
        const ingredientMap = new Map();

        this.selectedRecipes.forEach(recipe => {
            const multiplier = this.guestCount / recipe.servings;

            recipe.ingredients.forEach(ingredient => {
                const key = ingredient.name.toLowerCase();

                if (ingredientMap.has(key)) {
                    const existing = ingredientMap.get(key);
                    // Sčítání pouze pokud je stejná jednotka
                    if (existing.unit === ingredient.unit) {
                        existing.amount += ingredient.amount * multiplier;
                    } else {
                        // Pokud jsou různé jednotky, přidáme jako samostatnou položku
                        existing.variants = existing.variants || [];
                        existing.variants.push({
                            amount: ingredient.amount * multiplier,
                            unit: ingredient.unit
                        });
                    }
                } else {
                    ingredientMap.set(key, {
                        name: ingredient.name,
                        amount: ingredient.amount * multiplier,
                        unit: ingredient.unit,
                        category: ingredient.category
                    });
                }
            });
        });

        // Seskupení podle kategorií
        const categorized = {};
        ingredientMap.forEach(ingredient => {
            if (!categorized[ingredient.category]) {
                categorized[ingredient.category] = [];
            }
            categorized[ingredient.category].push(ingredient);
        });

        return categorized;
    }

    showShoppingList() {
        const modal = document.getElementById('shoppingModal');
        const listContainer = document.getElementById('shoppingList');

        document.getElementById('modalGuestCount').textContent = this.guestCount;

        const ingredients = this.calculateIngredients();

        listContainer.innerHTML = Object.entries(ingredients).map(([category, items]) => `
            <div class="ingredient-category">
                <h3>${category}</h3>
                ${items.map(item => {
                    let amountText = `${this.formatAmount(item.amount)} ${item.unit}`;
                    if (item.variants) {
                        const variantsText = item.variants
                            .map(v => `${this.formatAmount(v.amount)} ${v.unit}`)
                            .join(' + ');
                        amountText += ` + ${variantsText}`;
                    }
                    return `
                        <div class="ingredient-item">
                            <span class="ingredient-name">${item.name}</span>
                            <span class="ingredient-amount">${amountText}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `).join('');

        modal.classList.add('active');
    }

    formatAmount(amount) {
        // Zaokrouhlení na 2 desetinná místa, ale odstranění .00
        const rounded = Math.round(amount * 100) / 100;
        return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2);
    }

    copyShoppingList() {
        const ingredients = this.calculateIngredients();
        let text = `NÁKUPNÍ SEZNAM - ${this.guestCount} hostů\n`;
        text += '='.repeat(50) + '\n\n';

        Object.entries(ingredients).forEach(([category, items]) => {
            text += `${category.toUpperCase()}\n`;
            text += '-'.repeat(30) + '\n';
            items.forEach(item => {
                let amountText = `${this.formatAmount(item.amount)} ${item.unit}`;
                if (item.variants) {
                    const variantsText = item.variants
                        .map(v => `${this.formatAmount(v.amount)} ${v.unit}`)
                        .join(' + ');
                    amountText += ` + ${variantsText}`;
                }
                text += `[ ] ${item.name} - ${amountText}\n`;
            });
            text += '\n';
        });

        navigator.clipboard.writeText(text).then(() => {
            alert('Nákupní seznam byl zkopírován do schránky!');
        }).catch(err => {
            console.error('Chyba při kopírování:', err);
            alert('Nepodařilo se zkopírovat do schránky.');
        });
    }

    sendToRohlik() {
        const ingredients = this.calculateIngredients();

        // Vytvoření URL s parametry pro Rohlík.cz
        // Poznámka: Rohlík.cz nemá veřejné API pro přímé přidání do košíku,
        // takže vytvoříme formátovaný seznam a otevřeme jejich vyhledávání

        let searchTerms = [];
        Object.entries(ingredients).forEach(([category, items]) => {
            items.forEach(item => {
                searchTerms.push(item.name);
            });
        });

        // Vytvoření textu pro schránku s pokyny
        let rohlikText = `NÁKUPNÍ SEZNAM PRO ROHLÍK.CZ\n`;
        rohlikText += `Pro ${this.guestCount} hostů\n`;
        rohlikText += '='.repeat(50) + '\n\n';
        rohlikText += 'Vyhledejte následující položky na Rohlík.cz:\n\n';

        Object.entries(ingredients).forEach(([category, items]) => {
            rohlikText += `${category}:\n`;
            items.forEach(item => {
                let amountText = `${this.formatAmount(item.amount)} ${item.unit}`;
                if (item.variants) {
                    const variantsText = item.variants
                        .map(v => `${this.formatAmount(v.amount)} ${v.unit}`)
                        .join(' + ');
                    amountText += ` + ${variantsText}`;
                }
                rohlikText += `  • ${item.name} (${amountText})\n`;
            });
            rohlikText += '\n';
        });

        // Kopírování do schránky
        navigator.clipboard.writeText(rohlikText).then(() => {
            // Otevření Rohlík.cz v novém okně
            const rohlikUrl = 'https://www.rohlik.cz/';
            window.open(rohlikUrl, '_blank');

            alert(`✅ Nákupní seznam byl zkopírován do schránky!\n\n` +
                  `🚚 Otevírám Rohlík.cz v novém okně.\n\n` +
                  `📋 Seznam můžete vložit do poznámek nebo postupně vyhledat jednotlivé položky.`);
        }).catch(err => {
            console.error('Chyba při kopírování:', err);
            alert('Nepodařilo se zkopírovat seznam. Zkuste to znovu.');
        });
    }

    showTimeline() {
        const modal = document.getElementById('timelineModal');
        modal.classList.add('active');
        this.renderTimeline();
    }

    renderTimeline() {
        const timelineContainer = document.getElementById('timeline');
        const targetTimeInput = document.getElementById('targetTime');
        const targetTime = targetTimeInput.value;

        if (!targetTime) {
            alert('Prosím, zadejte cílový čas dokončení.');
            return;
        }

        // Převod času
        const [hours, minutes] = targetTime.split(':').map(Number);
        const targetMinutes = hours * 60 + minutes;

        // Seřazení receptů podle času přípravy (nejdelší první)
        const sortedRecipes = [...this.selectedRecipes].sort((a, b) => {
            return (b.prepTime + b.cookTime) - (a.prepTime + a.cookTime);
        });

        // Vytvoření časové osy
        let currentTime = targetMinutes;
        const timelineItems = [];

        // Cílový čas - podávání
        timelineItems.push({
            time: this.formatTimeFromMinutes(currentTime),
            title: '🍽️ Podávání',
            description: 'Všechna jídla jsou hotová a můžete podávat!',
            minutesFromNow: 0
        });

        // Zpětný výpočet časů
        sortedRecipes.forEach(recipe => {
            const totalTime = recipe.prepTime + recipe.cookTime;

            // Konec přípravy receptu
            const endTime = currentTime;

            // Začátek přípravy receptu
            currentTime -= totalTime;
            const startTime = currentTime;

            timelineItems.push({
                time: this.formatTimeFromMinutes(startTime),
                title: `${recipe.name}`,
                description: `Příprava: ${recipe.prepTime} min | Vaření: ${recipe.cookTime} min | Hotovo v ${this.formatTimeFromMinutes(endTime)}`,
                minutesFromNow: targetMinutes - startTime,
                recipe: recipe
            });
        });

        // Nákup ingrediencí (1 hodina před zahájením)
        const shoppingTime = currentTime - 60;
        timelineItems.push({
            time: this.formatTimeFromMinutes(shoppingTime),
            title: '🛒 Nákup ingrediencí',
            description: 'Doporučený čas na nákup všech surovin',
            minutesFromNow: targetMinutes - shoppingTime
        });

        // Seřazení od nejdřívějšího času
        timelineItems.reverse();

        // Vykreslení
        timelineContainer.innerHTML = timelineItems.map((item, index) => `
            <div class="timeline-item">
                <div class="timeline-time">${index + 1}</div>
                <div class="timeline-content">
                    <span class="time-label">${item.time}</span>
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
    }

    formatTimeFromMinutes(totalMinutes) {
        // Ošetření záporných hodnot (předchozí den)
        while (totalMinutes < 0) {
            totalMinutes += 24 * 60;
        }

        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
}

// Inicializace aplikace po načtení stránky
document.addEventListener('DOMContentLoaded', () => {
    new ChristmasMenuPlanner();
});
