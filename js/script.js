const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight * 0.6, // Game neemt 60% onderkant in
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

let player, cursors, treasures, score = 0, scoreText;
const collectedCardsDiv = document.getElementById('collectedCards');

const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'images/ocean-bg.png');
    this.load.image('player', 'images/diver.png');
    this.load.image('treasure', 'images/treasure.png');
}

function create() {
    // Achtergrond
    this.add.image(config.width / 2, config.height / 2, 'background')
        .setDisplaySize(config.width, config.height);

    // Speler kleiner maken (voor mobiel)
    const scaleFactor = window.innerWidth < 768 ? 0.3 : 0.5;
    player = this.physics.add.sprite(100, 100, 'player').setScale(scaleFactor);
    player.setCollideWorldBounds(false); // Zet wereldgrenzen uit zodat we oneindig kunnen bewegen

    // Maak lege treasure groep
    treasures = this.physics.add.group();

    // Voeg 6 schatten toe, random verspreid
    for (let i = 0; i < 6; i++) {
        const x = Phaser.Math.Between(100, config.width - 100);
        const y = Phaser.Math.Between(100, config.height - 100);
        const treasure = treasures.create(x, y, 'treasure').setScale(1.2);
        treasure.setVisible(false); // Start onzichtbaar
        treasure.setActive(true);
    }

    // Maak score tekst
    scoreText = this.add.text(10, 10, 'Kaarten gevonden: 0', {
        fontSize: '16px',
        fill: '#ffffff'
    });

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(player, treasures, collectTreasure, null, this);

    // Na korte delay, laat treasures verschijnen
    this.time.delayedCall(1000, () => {
        treasures.children.iterate(t => t.setVisible(true));
    });
}

function update() {
    player.setVelocity(0);

    if (cursors.left.isDown) player.setVelocityX(-160);
    else if (cursors.right.isDown) player.setVelocityX(160);

    if (cursors.up.isDown) player.setVelocityY(-160);
    else if (cursors.down.isDown) player.setVelocityY(160);

    // Wrap speler als hij de wereldranden bereikt
    if (player.x < 0) {
        player.x = config.width;
    } else if (player.x > config.width) {
        player.x = 0;
    }

    if (player.y < 0) {
        player.y = config.height;
    } else if (player.y > config.height) {
        player.y = 0;
    }
}

function collectTreasure(player, treasure) {
    treasure.disableBody(true, true);
    score++;
    scoreText.setText('Kaarten gevonden: ' + score);

    // Voeg kaart toe aan de bovenste box
    const cardImg = document.createElement('img');
    cardImg.src = 'images/treasure.png';
    cardImg.className = 'card';
    collectedCardsDiv.appendChild(cardImg);
}
