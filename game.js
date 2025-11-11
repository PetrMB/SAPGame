// SAP GCC - Incident Resolution Arcade Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nastavení canvasu
canvas.width = 1140;
canvas.height = 600;

// Herní konstanty
const GRAVITY = 0.5;
const PLAYER_SPEED = 5;
const PLAYER_SIZE = 40;
const FLOOR_HEIGHT = 30; // Zmenšeno pro lepší rozmístění
const FLOORS_COUNT = 6;
const FLOOR_SPACING = 85; // Rozestup mezi patry
const TOP_OFFSET = 90; // Offset od vrchu pro název budovy
const ENERGY_DRAIN_RATE = 0.035; // Zvýšeno pro cílový čas 1:30-2 min
const COFFEE_RESTORE = 30;

// Herní stav
let gameState = {
    running: false,
    paused: false,
    score: 0,
    resolvedIncidents: 0,
    energy: 100,
    time: 0,
    startTime: 0
};

// Hráč
let player = {
    x: 100,
    y: 0,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    velocityY: 0,
    speed: PLAYER_SPEED,
    floor: 0,
    direction: 1, // 1 = right, -1 = left
    isMoving: false,
    isNearElevator: false,
    isNearIncident: false,
    isNearCoffee: false,
    isResolvingIncident: false,
    incidentStartTime: 0,
    currentIncident: null
};

// Klávesy
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false
};

// Patra budovy - vypočítáno odzdola nahoru s offsetem
let floors = [];
for (let i = 0; i < FLOORS_COUNT; i++) {
    floors.push({
        y: canvas.height - FLOOR_HEIGHT - (i * FLOOR_SPACING),
        width: canvas.width,
        height: 20
    });
}

// Výtahy
let elevators = [
    { x: 50, width: 40, color: '#3498db' },
    { x: canvas.width - 90, width: 40, color: '#e74c3c' }
];

// Incidenty
let incidents = [];
const incidentTypes = [
    { name: 'CRITICAL', color: '#e74c3c', time: 5000, points: 100, emoji: '🔥', deadline: 20000 }, // 20s deadline
    { name: 'HIGH', color: '#e67e22', time: 3000, points: 50, emoji: '⚠️', deadline: 30000 },      // 30s deadline
    { name: 'MEDIUM', color: '#f39c12', time: 2000, points: 30, emoji: '🐛', deadline: 45000 },    // 45s deadline
    { name: 'LOW', color: '#3498db', time: 1000, points: 10, emoji: '📝', deadline: 60000 }        // 60s deadline
];

// Kávovary
let coffeeMachines = [];

// Částice (efekty)
let particles = [];

// ID intervalů pro správné čištění
let incidentInterval = null;

// Stav oken pro dynamické rozsvěcování
let windowStates = [];
let lastWindowUpdate = 0;
const WINDOW_UPDATE_INTERVAL = 2000; // Změna každé 2 sekundy

// Proměnná pro sledování odkud jsme přišli do žebříčku
let leaderboardSource = 'start'; // 'start' nebo 'game-over'

// Inicializace oken
function initWindows() {
    windowStates = [];
    for (let floor = 0; floor < FLOORS_COUNT; floor++) {
        windowStates[floor] = [];
        for (let i = 0; i < 15; i++) {
            windowStates[floor][i] = Math.random() > 0.3; // 70% šance na rozsvícení
        }
    }
}

// Aktualizace oken (náhodné blikání)
function updateWindows() {
    const now = Date.now();
    if (now - lastWindowUpdate > WINDOW_UPDATE_INTERVAL) {
        // Změň náhodně 2-3 okna
        const changes = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < changes; i++) {
            const floor = Math.floor(Math.random() * FLOORS_COUNT);
            const window = Math.floor(Math.random() * 15);
            windowStates[floor][window] = !windowStates[floor][window];
        }
        lastWindowUpdate = now;
    }
}

// Inicializace kávovarů
function initCoffeeMachines() {
    coffeeMachines = [];
    for (let i = 0; i < FLOORS_COUNT; i++) {
        if (i % 2 === 1) { // Kávovar na každém druhém patře
            coffeeMachines.push({
                x: canvas.width / 2 - 30,
                y: floors[i].y - 50,
                width: 60,
                height: 50,
                floor: i,
                active: true
            });
        }
    }
}

// Vytvoření nového incidentu
function createIncident() {
    if (incidents.length >= 5) return; // Max 5 incidentů současně

    const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
    const floorIndex = Math.floor(Math.random() * FLOORS_COUNT);
    const x = Math.random() * (canvas.width - 200) + 100;

    // Kontrola, zda se nepřekrývá s jiným incidentem
    const tooClose = incidents.some(inc =>
        Math.abs(inc.x - x) < 100 && inc.floor === floorIndex
    );

    if (!tooClose) {
        const now = Date.now();
        incidents.push({
            x: x,
            y: floors[floorIndex].y - 60,
            width: 50,
            height: 50,
            floor: floorIndex,
            type: type,
            createdAt: now,
            deadlineAt: now + type.deadline,
            pulse: 0
        });
    }
}

// Kontrola deadlinů incidentů
function checkIncidentDeadlines() {
    const now = Date.now();
    const expiredIncidents = [];

    incidents.forEach(incident => {
        // Pokud incident není právě řešený a vypršel deadline
        const isBeingResolved = player.isResolvingIncident && player.currentIncident === incident;
        if (now > incident.deadlineAt && !isBeingResolved) {
            expiredIncidents.push(incident);
        }
    });

    // Zpracuj expirované incidenty
    expiredIncidents.forEach(incident => {
        // Odečti polovinu bodů jako penalizaci
        const penalty = Math.floor(incident.type.points / 2);
        gameState.score = Math.max(0, gameState.score - penalty);

        // Vytvoř negativní částici
        createParticle(
            incident.x + incident.width / 2,
            incident.y,
            '#e74c3c',
            '-' + penalty
        );

        // Odeber incident
        incidents = incidents.filter(inc => inc !== incident);
    });
}

// Vytvoření částice
function createParticle(x, y, color, text = '') {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 - 2,
            life: 1,
            color: color,
            size: Math.random() * 5 + 2,
            text: i === 0 ? text : ''
        });
    }
}

// Aktualizace částic
function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
    });
}

// Vykreslení částic
function drawParticles() {
    ctx.save(); // Uložit stav canvasu

    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.text) {
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
        }
    });

    ctx.restore(); // Obnovit stav canvasu
}

// Vykreslení pozadí budovy
function drawBuilding() {
    // Pozadí oblohy
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2c3e50');
    gradient.addColorStop(1, '#34495e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hvězdy (náhodně)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 123) % canvas.width;
        const y = (i * 456) % (canvas.height - 100);
        const size = (i % 3) + 1;
        ctx.fillRect(x, y, size, size);
    }

    // Název budovy nahoře
    ctx.fillStyle = 'rgba(0, 150, 70, 0.3)'; // Škoda zelená
    ctx.fillRect(0, 0, canvas.width, 50);
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('SAP GROUP COMPETENCE CENTER', canvas.width / 2, 35);
    ctx.textAlign = 'left';

    // Vykreslení pater
    floors.forEach((floor, index) => {
        // Podlaha
        const floorGradient = ctx.createLinearGradient(0, floor.y, 0, floor.y + floor.height);
        floorGradient.addColorStop(0, '#95a5a6');
        floorGradient.addColorStop(1, '#7f8c8d');
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, floor.y, floor.width, floor.height);

        // Číslo patra - na podlaze, bílý text bez kontury
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${index + 1}. PATRO`, 10, floor.y + 18);
    });

    // Vykreslení oken (před výtahy)
    floors.forEach((floor, index) => {
        for (let i = 0; i < 15; i++) {
            const windowX = i * 75 + 40;
            const windowY = floor.y - 65;
            const windowWidth = 30;

            // Kontrola, aby okna nebyla za výtahy - rozšířená kontrola
            const isUnderElevator = elevators.some(elev => {
                const elevLeft = elev.x - 15; // Větší buffer vlevo
                const elevRight = elev.x + elev.width + 15; // Větší buffer vpravo
                const windowRight = windowX + windowWidth;

                // Okno překrývá výtah, pokud:
                // - začátek okna je v rozsahu výtahu NEBO
                // - konec okna je v rozsahu výtahu NEBO
                // - okno obklopuje výtah
                return (windowX >= elevLeft && windowX <= elevRight) ||
                       (windowRight >= elevLeft && windowRight <= elevRight) ||
                       (windowX <= elevLeft && windowRight >= elevRight);
            });

            if (isUnderElevator) continue; // Přeskoč okna pod výtahy

            // Použij dynamický stav okna
            const lightOn = windowStates[index] && windowStates[index][i];

            ctx.fillStyle = lightOn ? '#f39c12' : '#34495e';
            ctx.fillRect(windowX, windowY, 30, 40);

            // Okenní křížek
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(windowX + 15, windowY);
            ctx.lineTo(windowX + 15, windowY + 40);
            ctx.moveTo(windowX, windowY + 20);
            ctx.lineTo(windowX + 30, windowY + 20);
            ctx.stroke();
        }
    });

    // Vykreslení výtahů - jako segmenty mezi patry a nad nejvyšším patrem
    const ELEVATOR_CABIN_HEIGHT = 50; // Fixní výška kabiny výtahu

    elevators.forEach(elevator => {
        // Pro každý prostor mezi patry
        for (let i = 0; i < FLOORS_COUNT - 1; i++) {
            const bottomFloor = floors[i];
            const topFloor = floors[i + 1];

            const gap = 10; // Mezera od podlahy
            const shaftTop = topFloor.y + topFloor.height + gap; // Začátek od spodku horní podlahy
            const shaftBottom = bottomFloor.y - gap; // Konec před dolní podlahou
            const shaftHeight = shaftBottom - shaftTop;

            // Šachta výtahu
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(elevator.x, shaftTop, elevator.width, shaftHeight);

            // Kabina výtahu - fixní výška, centrovaná ve šachtě
            const cabinY = shaftTop + (shaftHeight - ELEVATOR_CABIN_HEIGHT) / 2;
            const elevatorGradient = ctx.createLinearGradient(
                elevator.x, 0, elevator.x + elevator.width, 0
            );
            elevatorGradient.addColorStop(0, elevator.color);
            elevatorGradient.addColorStop(1, '#2c3e50');
            ctx.fillStyle = elevatorGradient;
            ctx.fillRect(elevator.x + 5, cabinY, elevator.width - 10, ELEVATOR_CABIN_HEIGHT);

            // Symbol výtahu (centrovaný v kabině)
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('🛗', elevator.x + elevator.width / 2, cabinY + ELEVATOR_CABIN_HEIGHT / 2 + 7);
        }

        // Segment nad nejvyšším patrem
        const topFloor = floors[FLOORS_COUNT - 1];
        const gap = 10;
        const shaftTop = 50; // Začátek pod názvem budovy
        const shaftBottom = topFloor.y - gap;
        const shaftHeight = shaftBottom - shaftTop;

        // Šachta výtahu
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(elevator.x, shaftTop, elevator.width, shaftHeight);

        // Kabina výtahu - fixní výška, centrovaná ve šachtě
        const cabinY = shaftTop + (shaftHeight - ELEVATOR_CABIN_HEIGHT) / 2;
        const elevatorGradient = ctx.createLinearGradient(
            elevator.x, 0, elevator.x + elevator.width, 0
        );
        elevatorGradient.addColorStop(0, elevator.color);
        elevatorGradient.addColorStop(1, '#2c3e50');
        ctx.fillStyle = elevatorGradient;
        ctx.fillRect(elevator.x + 5, cabinY, elevator.width - 10, ELEVATOR_CABIN_HEIGHT);

        // Symbol výtahu (centrovaný v kabině)
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('🛗', elevator.x + elevator.width / 2, cabinY + ELEVATOR_CABIN_HEIGHT / 2 + 7);
    });
    ctx.textAlign = 'left';
}

// Vykreslení kávovarů
function drawCoffeeMachines() {
    ctx.save(); // Uložit stav canvasu

    coffeeMachines.forEach(machine => {
        if (!machine.active) return;

        // Tělo kávovaru
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(machine.x, machine.y, machine.width, machine.height);

        // Displej
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(machine.x + 10, machine.y + 5, machine.width - 20, 15);

        // Tlačítka
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(machine.x + 10, machine.y + 25, 15, 15);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(machine.x + 35, machine.y + 25, 15, 15);

        // Emoji
        ctx.font = '30px Arial';
        ctx.fillStyle = '#8B4513';
        ctx.fillText('☕', machine.x + machine.width / 2 - 15, machine.y - 10);

        // Animace páry
        const steam = Math.sin(Date.now() / 200) * 5;
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(machine.x + machine.width / 2 - 5, machine.y - 20 + steam, 3, 10);
        ctx.fillRect(machine.x + machine.width / 2 + 5, machine.y - 25 + steam, 3, 10);
    });

    ctx.restore(); // Obnovit stav canvasu
}

// Vykreslení incidentů (jako počítače)
function drawIncidents() {
    ctx.save(); // Uložit stav canvasu
    const now = Date.now();

    incidents.forEach(incident => {
        // Pulsující efekt
        incident.pulse = Math.sin(now / 200) * 3;

        const pcX = incident.x - incident.pulse / 2;
        const pcY = incident.y - incident.pulse / 2;
        const pcWidth = incident.width + incident.pulse;
        const pcHeight = incident.height + incident.pulse;

        // Stín
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(pcX + 5, pcY + 5, pcWidth, pcHeight);

        // Základna monitoru (stojánek)
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(pcX + pcWidth / 2 - 15, pcY + pcHeight - 5, 30, 8);
        ctx.fillRect(pcX + pcWidth / 2 - 5, pcY + pcHeight - 12, 10, 12);

        // Monitor - rám
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(pcX, pcY, pcWidth, pcHeight - 10);

        // Monitor - obrazovka (s barvou podle typu incidentu)
        const screenPadding = 5;
        ctx.fillStyle = incident.type.color;
        ctx.fillRect(
            pcX + screenPadding,
            pcY + screenPadding,
            pcWidth - screenPadding * 2,
            pcHeight - 15 - screenPadding
        );

        // "Obrazovka" s chybovou hláškou
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ERROR!', pcX + pcWidth / 2, pcY + pcHeight / 2 - 5);

        // Emoji incident typu
        ctx.font = '20px Arial';
        ctx.fillText(incident.type.emoji, pcX + pcWidth / 2, pcY + pcHeight / 2 + 10);

        // Název typu pod monitorem
        ctx.font = 'bold 9px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeText(incident.type.name, pcX + pcWidth / 2, pcY + pcHeight + 10);
        ctx.fillText(incident.type.name, pcX + pcWidth / 2, pcY + pcHeight + 10);

        // Deadline timer (čas do expirace)
        const timeRemaining = incident.deadlineAt - now;
        const timeRemainingSeconds = Math.max(0, Math.ceil(timeRemaining / 1000));
        const deadlineProgress = Math.max(0, timeRemaining / incident.type.deadline);

        // Barva podle zbývajícího času
        let timerColor = '#2ecc71'; // zelená
        if (deadlineProgress < 0.3) {
            timerColor = '#e74c3c'; // červená - kriticky málo času
            // Blikání při kritickém čase
            if (Math.floor(now / 250) % 2 === 0) {
                incident.pulse += 5; // Silnější pulsace
            }
        } else if (deadlineProgress < 0.5) {
            timerColor = '#f39c12'; // oranžová - málo času
        }

        // Deadline bar nad monitorem
        const deadlineBarY = pcY - 15;
        const deadlineBarWidth = pcWidth;

        // Pozadí deadline baru
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(pcX, deadlineBarY, deadlineBarWidth, 8);

        // Vyplněný deadline progress
        ctx.fillStyle = timerColor;
        ctx.fillRect(pcX, deadlineBarY, deadlineBarWidth * deadlineProgress, 8);

        // Ohraničení deadline baru
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(pcX, deadlineBarY, deadlineBarWidth, 8);

        // Zbývající čas (text)
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = timerColor;
        ctx.textAlign = 'center';
        ctx.fillText(`⏱️ ${timeRemainingSeconds}s`, pcX + pcWidth / 2, deadlineBarY - 3);

        // Progress bar při řešení - pod monitorem
        if (player.isResolvingIncident && player.currentIncident === incident) {
            const elapsed = now - player.incidentStartTime;
            const progress = Math.min(elapsed / incident.type.time, 1);

            const barY = incident.y + incident.height + 25;
            const barWidth = incident.width + 10;

            // Pozadí progress baru
            ctx.fillStyle = '#34495e';
            ctx.fillRect(incident.x - 5, barY, barWidth, 12);

            // Vyplněný progress
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(incident.x - 5, barY, barWidth * progress, 12);

            // Ohraničení
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(incident.x - 5, barY, barWidth, 12);

            // Procento dokončení
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(progress * 100)}%`, incident.x + incident.width / 2, barY + 9);
        }
    });

    ctx.restore(); // Obnovit stav canvasu
}

// Vykreslení hráče
function drawPlayer() {
    // Stín
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(player.x + player.width / 2, player.y + player.height + 5, player.width / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tělo (oblek)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(player.x + 5, player.y + 15, player.width - 10, player.height - 20);

    // Hlava
    ctx.fillStyle = '#ffd1a3';
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + 10, 12, 0, Math.PI * 2);
    ctx.fill();

    // Kravata
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y + 18);
    ctx.lineTo(player.x + player.width / 2 - 3, player.y + 25);
    ctx.lineTo(player.x + player.width / 2, player.y + 35);
    ctx.lineTo(player.x + player.width / 2 + 3, player.y + 25);
    ctx.closePath();
    ctx.fill();

    // Oči
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + player.width / 2 - 5, player.y + 8, 3, 3);
    ctx.fillRect(player.x + player.width / 2 + 2, player.y + 8, 3, 3);

    // Úsměv nebo stres (podle energie)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (gameState.energy > 50) {
        ctx.arc(player.x + player.width / 2, player.y + 12, 4, 0, Math.PI);
    } else {
        ctx.arc(player.x + player.width / 2, player.y + 15, 4, Math.PI, Math.PI * 2);
    }
    ctx.stroke();

    // Nohy (animace chůze)
    if (player.isMoving) {
        const legSwing = Math.sin(Date.now() / 100) * 5;
        ctx.fillStyle = '#34495e';
        ctx.fillRect(player.x + 10, player.y + player.height - 5, 8, 5 + legSwing);
        ctx.fillRect(player.x + player.width - 18, player.y + player.height - 5, 8, 5 - legSwing);
    } else {
        ctx.fillStyle = '#34495e';
        ctx.fillRect(player.x + 10, player.y + player.height - 5, 8, 5);
        ctx.fillRect(player.x + player.width - 18, player.y + player.height - 5, 8, 5);
    }

    // Tašku (brašna)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(player.x - 5, player.y + 20, 8, 15);

    // Indikátor akce
    if (player.isNearElevator) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('↑↓ Výtah', player.x - 10, player.y - 10);
    } else if (player.isNearIncident) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('SPACE Řešit', player.x - 15, player.y - 10);
    } else if (player.isNearCoffee) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('SPACE Káva', player.x - 10, player.y - 10);
    }
}

// Kontrola kolizí
function checkCollisions() {
    // Reset flagů
    player.isNearElevator = false;
    player.isNearIncident = false;
    player.isNearCoffee = false;

    // Kontrola výtahů
    elevators.forEach(elevator => {
        if (player.x + player.width > elevator.x &&
            player.x < elevator.x + elevator.width) {
            player.isNearElevator = true;
        }
    });

    // Kontrola incidentů
    incidents.forEach(incident => {
        if (Math.abs(player.x - incident.x) < 60 &&
            player.floor === incident.floor) {
            player.isNearIncident = true;
            player.currentIncident = incident;
        }
    });

    // Kontrola kávovarů
    coffeeMachines.forEach(machine => {
        if (machine.active &&
            Math.abs(player.x - machine.x) < 60 &&
            player.floor === machine.floor) {
            player.isNearCoffee = true;
        }
    });
}

// Pohyb hráče
function updatePlayer() {
    player.isMoving = false;

    // Pohyb doleva/doprava
    if (keys.left && !player.isResolvingIncident) {
        player.x -= player.speed;
        player.direction = -1;
        player.isMoving = true;
        if (player.x < 0) player.x = 0;
    }
    if (keys.right && !player.isResolvingIncident) {
        player.x += player.speed;
        player.direction = 1;
        player.isMoving = true;
        if (player.x > canvas.width - player.width) {
            player.x = canvas.width - player.width;
        }
    }

    // Výtah nahoru
    if (keys.up && player.isNearElevator && !player.isResolvingIncident) {
        if (player.floor < FLOORS_COUNT - 1) {
            player.floor++;
            player.y = floors[player.floor].y - player.height;
            createParticle(player.x + player.width / 2, player.y, '#3498db', '⬆️');
            keys.up = false;
        }
    }

    // Výtah dolů
    if (keys.down && player.isNearElevator && !player.isResolvingIncident) {
        if (player.floor > 0) {
            player.floor--;
            player.y = floors[player.floor].y - player.height;
            createParticle(player.x + player.width / 2, player.y, '#e74c3c', '⬇️');
            keys.down = false;
        }
    }

    // Řešení incidentu
    if (keys.space && player.isNearIncident && !player.isResolvingIncident) {
        player.isResolvingIncident = true;
        player.incidentStartTime = Date.now();
    }

    // Doplnění kávy
    if (keys.space && player.isNearCoffee && !player.isResolvingIncident) {
        gameState.energy = Math.min(100, gameState.energy + COFFEE_RESTORE);
        createParticle(player.x + player.width / 2, player.y, '#f39c12', '+' + COFFEE_RESTORE);

        // Deaktivace kávovaru na chvíli
        coffeeMachines.forEach(machine => {
            if (machine.active &&
                Math.abs(player.x - machine.x) < 60 &&
                player.floor === machine.floor) {
                machine.active = false;
                setTimeout(() => machine.active = true, 10000);
            }
        });
        keys.space = false;
    }

    // Kontrola dokončení incidentu
    if (player.isResolvingIncident && player.currentIncident) {
        const elapsed = Date.now() - player.incidentStartTime;
        if (elapsed >= player.currentIncident.type.time) {
            // Incident vyřešen
            gameState.score += player.currentIncident.type.points;
            gameState.resolvedIncidents++;
            createParticle(
                player.currentIncident.x + 25,
                player.currentIncident.y,
                '#2ecc71',
                '+' + player.currentIncident.type.points
            );

            incidents = incidents.filter(inc => inc !== player.currentIncident);
            player.isResolvingIncident = false;
            player.currentIncident = null;
            keys.space = false;
        }
    }

    // Nastavení pozice Y podle patra
    if (!player.isResolvingIncident) {
        player.y = floors[player.floor].y - player.height;
    }

    // Drain energie
    gameState.energy -= ENERGY_DRAIN_RATE;
    if (player.isResolvingIncident) {
        gameState.energy -= ENERGY_DRAIN_RATE * 2; // Více úbytku při řešení
    }

    if (gameState.energy <= 0) {
        gameState.energy = 0;
        gameOver();
    }
}

// Aktualizace UI
function updateUI() {
    // Energie
    const energyFill = document.getElementById('energy-fill');
    const energyValue = document.getElementById('energy-value');
    energyFill.style.width = gameState.energy + '%';
    energyValue.textContent = Math.round(gameState.energy) + '%';

    if (gameState.energy < 30) {
        energyFill.classList.add('low');
    } else {
        energyFill.classList.remove('low');
    }

    // Skóre
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('resolved').textContent = gameState.resolvedIncidents;

    // Čas
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('time').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Hlavní herní smyčka
function gameLoop() {
    if (!gameState.running) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Vykreslení
    drawBuilding();
    drawCoffeeMachines();
    drawIncidents();
    drawPlayer();
    drawParticles();

    // Aktualizace
    updatePlayer();
    updateParticles();
    updateWindows(); // Aktualizace dynamických oken
    checkCollisions();
    checkIncidentDeadlines(); // Kontrola deadlinů incidentů
    updateUI();

    requestAnimationFrame(gameLoop);
}

// Game Over
function gameOver() {
    gameState.running = false;

    // Vyčištění intervalu
    if (incidentInterval) {
        clearInterval(incidentInterval);
        incidentInterval = null;
    }

    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-resolved').textContent = gameState.resolvedIncidents;

    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    document.getElementById('final-time').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('game-over').classList.remove('hidden');
}

// Start hry
function startGame() {
    // Vyčištění předchozího intervalu, pokud existuje
    if (incidentInterval) {
        clearInterval(incidentInterval);
        incidentInterval = null;
    }

    // Reset
    gameState = {
        running: true,
        paused: false,
        score: 0,
        resolvedIncidents: 0,
        energy: 100,
        time: 0,
        startTime: Date.now()
    };

    player = {
        x: 100,
        y: floors[0].y - PLAYER_SIZE,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
        velocityY: 0,
        speed: PLAYER_SPEED,
        floor: 0,
        direction: 1,
        isMoving: false,
        isNearElevator: false,
        isNearIncident: false,
        isNearCoffee: false,
        isResolvingIncident: false,
        incidentStartTime: 0,
        currentIncident: null
    };

    incidents = [];
    particles = [];
    initCoffeeMachines();
    initWindows(); // Inicializace stavu oken

    // Vytvoření počátečních incidentů
    for (let i = 0; i < 3; i++) {
        setTimeout(() => createIncident(), i * 1000);
    }

    // Pravidelné vytváření incidentů
    incidentInterval = setInterval(() => {
        if (gameState.running && incidents.length < 5) {
            createIncident();
        }
    }, 5000);

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');

    gameLoop();
}

// Ovládání klávesnice
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
    if (e.key === ' ') keys.space = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
    if (e.key === ' ') keys.space = false;
});

// === ŽEBŘÍČEK - LEADERBOARD SYSTEM ===

// Kontrola, zda je Firebase dostupné
function isFirebaseEnabled() {
    return typeof USE_FIREBASE !== 'undefined' && USE_FIREBASE &&
           typeof firebase !== 'undefined' && firebase.apps.length > 0;
}

// Načtení žebříčku (Firebase nebo localStorage)
async function getLeaderboard() {
    if (isFirebaseEnabled()) {
        try {
            const db = firebase.database();
            const snapshot = await db.ref('leaderboard').orderByChild('score').limitToLast(50).once('value');
            const data = snapshot.val();

            if (!data) return [];

            // Převést na pole a seřadit
            const leaderboard = Object.values(data);
            leaderboard.sort((a, b) => b.score - a.score);
            return leaderboard.slice(0, 50); // Top 50 pro globální žebříček
        } catch (error) {
            console.error('Chyba při načítání Firebase žebříčku:', error);
            // Fallback na localStorage
            return getLocalLeaderboard();
        }
    } else {
        return getLocalLeaderboard();
    }
}

// Načtení lokálního žebříčku z localStorage
function getLocalLeaderboard() {
    const leaderboard = localStorage.getItem('sapGccLeaderboard');
    return leaderboard ? JSON.parse(leaderboard) : [];
}

// Uložení žebříčku (Firebase nebo localStorage)
async function saveScore(name, score, resolved, time) {
    const entry = {
        name: name.trim().substring(0, 10), // Max 10 znaků
        score: score,
        resolved: resolved,
        time: time,
        date: new Date().toISOString()
    };

    if (isFirebaseEnabled()) {
        try {
            const db = firebase.database();
            // Přidat nové skóre s unikátním ID
            await db.ref('leaderboard').push(entry);
            console.log('Skóre uloženo do globálního žebříčku! 🌍');
            return true;
        } catch (error) {
            console.error('Chyba při ukládání do Firebase:', error);
            // Fallback na localStorage
            saveLocalScore(entry);
            return false;
        }
    } else {
        saveLocalScore(entry);
        return true;
    }
}

// Uložení do lokálního žebříčku
function saveLocalScore(entry) {
    const leaderboard = getLocalLeaderboard();
    leaderboard.push(entry);
    leaderboard.sort((a, b) => b.score - a.score);
    const top10 = leaderboard.slice(0, 10);
    localStorage.setItem('sapGccLeaderboard', JSON.stringify(top10));
}

// Přidání nového skóre (zachováno pro zpětnou kompatibilitu)
async function addScore(name, score, resolved, time) {
    await saveScore(name, score, resolved, time);
    return await getLeaderboard();
}

// Zobrazení žebříčku
async function displayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');

    // Zobrazit loading
    leaderboardList.innerHTML = '<div class="loading">⏳ Načítám žebříček...</div>';

    try {
        const leaderboard = await getLeaderboard();

        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<div class="no-scores">Zatím žádná skóre. Buď první! 🏆</div>';
            return;
        }

        // Přidat info o typu žebříčku
        const typeInfo = isFirebaseEnabled()
            ? '<div class="leaderboard-type">🌍 Globální žebříček</div>'
            : '<div class="leaderboard-type">💻 Lokální žebříček</div>';

        let html = typeInfo;
        leaderboard.forEach((entry, index) => {
            const rank = index + 1;
            let rankClass = '';
            let medal = '';

            if (rank === 1) {
                rankClass = 'top-1';
                medal = '🥇';
            } else if (rank === 2) {
                rankClass = 'top-2';
                medal = '🥈';
            } else if (rank === 3) {
                rankClass = 'top-3';
                medal = '🥉';
            }

            const date = new Date(entry.date);
            const dateStr = date.toLocaleDateString('cs-CZ');

            html += `
                <div class="leaderboard-item ${rankClass}">
                    <div class="leaderboard-rank">${medal || ''} ${rank}.</div>
                    <div class="leaderboard-name">
                        ${entry.name}
                        <div class="leaderboard-details">
                            ${entry.resolved} incidentů • ${entry.time} • ${dateStr}
                        </div>
                    </div>
                    <div class="leaderboard-score">${entry.score} bodů</div>
                </div>
            `;
        });

        leaderboardList.innerHTML = html;
    } catch (error) {
        console.error('Chyba při zobrazování žebříčku:', error);
        leaderboardList.innerHTML = '<div class="error">❌ Chyba při načítání žebříčku</div>';
    }
}

// Uložení skóre
document.getElementById('save-score-btn').addEventListener('click', async () => {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim();
    const saveBtn = document.getElementById('save-score-btn');

    if (!name) {
        alert('Prosím zadej své jméno!');
        nameInput.focus();
        return;
    }

    if (name.length > 10) {
        alert('Jméno může mít maximálně 10 znaků!');
        return;
    }

    // Získat finální statistiky z DOM
    const score = parseInt(document.getElementById('final-score').textContent);
    const resolved = parseInt(document.getElementById('final-resolved').textContent);
    const time = document.getElementById('final-time').textContent;

    // Zobrazit loading
    saveBtn.textContent = '⏳ Ukládám...';
    saveBtn.disabled = true;

    try {
        // Přidat do žebříčku
        await addScore(name, score, resolved, time);

        // Zobrazit potvrzení
        const message = isFirebaseEnabled()
            ? '✅ Skóre uloženo do globálního žebříčku! 🌍'
            : '✅ Skóre uloženo lokálně!';

        document.getElementById('saved-message').innerHTML = `<p>${message}</p>`;
        document.getElementById('name-input-section').classList.add('hidden');
        document.getElementById('saved-message').classList.remove('hidden');
    } catch (error) {
        console.error('Chyba při ukládání skóre:', error);
        alert('❌ Chyba při ukládání skóre. Zkus to znovu.');
        saveBtn.textContent = '💾 Uložit skóre';
        saveBtn.disabled = false;
    }
});

// Zavřít žebříček
document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
    document.getElementById('leaderboard-screen').classList.add('hidden');
    // Vrátit se na předchozí obrazovku
    if (leaderboardSource === 'game-over') {
        document.getElementById('game-over').classList.remove('hidden');
    } else {
        document.getElementById('start-screen').classList.remove('hidden');
    }
});

// Enter pro uložení skóre
document.getElementById('player-name').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('save-score-btn').click();
    }
});

// Zobrazit žebříček z game over obrazovky
document.getElementById('view-leaderboard-btn').addEventListener('click', () => {
    leaderboardSource = 'game-over';
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('leaderboard-screen').classList.remove('hidden');
    displayLeaderboard();
});

// Zobrazit žebříček ze start obrazovky
document.getElementById('start-leaderboard-btn').addEventListener('click', () => {
    leaderboardSource = 'start';
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('leaderboard-screen').classList.remove('hidden');
    displayLeaderboard();
});

// === KONEC ŽEBŘÍČKU ===

// === ESC KLÁVESA PRO ZAVŘENÍ OBRAZOVEK ===

// Globální ESC handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const gameOver = document.getElementById('game-over');
        const startScreen = document.getElementById('start-screen');
        const leaderboardScreen = document.getElementById('leaderboard-screen');

        // Pokud je zobrazen žebříček, vrátit se na předchozí obrazovku
        if (!leaderboardScreen.classList.contains('hidden')) {
            leaderboardScreen.classList.add('hidden');
            if (leaderboardSource === 'game-over') {
                gameOver.classList.remove('hidden');
            } else {
                startScreen.classList.remove('hidden');
            }
            return;
        }

        // Pokud je zobrazena game over obrazovka, vrátit se na start
        if (!gameOver.classList.contains('hidden')) {
            gameOver.classList.add('hidden');
            startScreen.classList.remove('hidden');
            // Reset formuláře
            document.getElementById('player-name').value = '';
            document.getElementById('name-input-section').classList.remove('hidden');
            document.getElementById('saved-message').classList.add('hidden');
            document.getElementById('save-score-btn').disabled = false;
            return;
        }
    }
});

// === KONEC ESC HANDLERU ===

// Tlačítka
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => {
    // Reset formuláře při restartu
    document.getElementById('player-name').value = '';
    document.getElementById('name-input-section').classList.remove('hidden');
    document.getElementById('saved-message').classList.add('hidden');
    document.getElementById('save-score-btn').disabled = false;
    startGame();
});

// Inicializace
initCoffeeMachines();
initWindows();
