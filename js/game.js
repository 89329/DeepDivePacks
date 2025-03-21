// game.js
let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let oceanAnimals = {
    'Atlantic': ['Walvis', 'Dolfijn', 'Haaien', 'Zeehond', 'Schildpad', 'Tonijn', 'Kreeft', 'Zeepaard', 'Inktvis', 'Octopus'],
    'Pacific': ['Reuzenmant', 'Koraalvis', 'Orka', 'Manta', 'Zeepaardje', 'Haai', 'Dolfijn', 'Tropische vis', 'Garnalen', 'Zeewolf'],
    'Indian': ['Zeeschildpad', 'Dolfijn', 'Walvis', 'Zeehond', 'Hammerhaai', 'Tonijn', 'Koraal', 'Manta', 'Kreeft', 'Rifhaai'],
    'Arctic': ['IJsbeer', 'Walrus', 'Narwal', 'Beluga', 'Zeehond', 'Poolvissen', 'Minke walvis', 'Groenlandse walvis', 'Arctische haai', 'Poolvogel'],
    'Antarctic': ['Pinguïn', 'Zeeleeuw', 'Blauwe walvis', 'Orka', 'Paleisvogel', 'Krill', 'Schelpdier', 'Zeehond', 'Antarctische vis', 'Witbuikpinguïn']
};

let selectedOcean = 'Atlantic';  // Begin met de Atlantische Oceaan
let animalsFound = [];

let game = new Phaser.Game(config);

function preload() {
    // Laad beelden voor dieren
    this.load.image('whale', 'assets/whale.png');  // Voorbeeld, vervang door eigen afbeeldingen
    this.load.image('dolphin', 'assets/dolphin.png');
    // Voeg hier meer diersprites toe
}

function create() {
    // Begin game met een simpele achtergrond
    this.add.rectangle(0, 0, 800, 600, 0x87CEEB).setOrigin(0, 0);  // Blauwe oceaan achtergrond

    // Titel
    this.add.text(20, 20, `Welkom in de ${selectedOcean} Oceaan`, { font: '32px Arial', fill: '#fff' });

    // Genereer 10 willekeurige dieren
    generateAnimals(this);

    // Voeg een knop toe om te wisselen van oceaan
    let oceanButton = this.add.text(650, 550, 'Wissel Oceaan', { font: '20px Arial', fill: '#fff' })
        .setInteractive()
        .on('pointerdown', () => {
            let oceans = Object.keys(oceanAnimals);
            let nextOcean = oceans[(oceans.indexOf(selectedOcean) + 1) % oceans.length];
            selectedOcean = nextOcean;
            animalsFound = [];
            this.scene.restart();
        });
}

function update() {
    // Hier kan je extra dynamische logica toevoegen, zoals beweging of andere interacties
}

function generateAnimals(scene) {
    let animalsToShow = oceanAnimals[selectedOcean].slice(0, 10); // Kies de eerste 10 dieren voor deze oceaan

    animalsToShow.forEach((animal, index) => {
        let x = Phaser.Math.Between(100, 700);
        let y = Phaser.Math.Between(100, 500);

        let animalSprite = scene.add.sprite(x, y, animal.toLowerCase()).setInteractive();
        animalSprite.on('pointerdown', () => {
            if (!animalsFound.includes(animal)) {
                animalsFound.push(animal);
                alert(`Gefeliciteerd! Je hebt de ${animal} gevonden!`);
            }
        });
    });
}
