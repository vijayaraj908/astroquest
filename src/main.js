import Phaser from 'phaser';
import './style.css';

// ======================================
// ASTROQUEST - MAIN MENU
// ======================================

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = 1000;
    const height = 650;

    this.add.rectangle(0, 0, width, height, 0x080e1c).setOrigin(0);

    // Stars
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, 430);

      const star = this.add.circle(
        x,
        y,
        Phaser.Math.FloatBetween(0.7, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );

      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(800, 2200),
        yoyo: true,
        repeat: -1
      });
    }

    // Earth
    this.add.circle(825, 145, 57, 0x2475b8, 0.9);
    this.add.circle(825, 145, 48, 0x173f78, 0.9);
    this.add.ellipse(810, 130, 27, 15, 0x56a66c, 0.8);
    this.add.ellipse(840, 158, 22, 12, 0x56a66c, 0.8);

    // Moon surface
    this.add.ellipse(500, 590, 1400, 350, 0x555d6b);
    this.add.ellipse(500, 615, 1300, 240, 0x343d4d);

    this.add.ellipse(140, 545, 120, 35, 0x343b49);
    this.add.ellipse(820, 565, 160, 42, 0x303847);
    this.add.ellipse(560, 600, 90, 25, 0x222b3a);

    this.add.text(
      500, 105,
      'NASA SPACE APPS CHALLENGE 2026',
      {
        fontSize: '15px',
        color: '#73c9ff',
        fontStyle: 'bold',
        letterSpacing: 3
      }
    ).setOrigin(0.5);

    this.add.text(
      500, 190,
      'ASTROQUEST',
      {
        fontSize: '76px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#16416c',
        strokeThickness: 3
      }
    ).setOrigin(0.5);

    this.add.text(
      500, 255,
      'JUNIOR ASTRONAUT MISSION TRAINER',
      {
        fontSize: '19px',
        color: '#91bde0',
        letterSpacing: 4
      }
    ).setOrigin(0.5);

    this.add.text(
      500, 325,
      'Explore the Moon. Manage your crew. Survive the mission.',
      {
        fontSize: '17px',
        color: '#d3dce9'
      }
    ).setOrigin(0.5);

    const button = this.add.rectangle(
      500, 415, 260, 65, 0x1687d9
    );

    button.setStrokeStyle(2, 0x80d5ff);
    button.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(
      500, 415,
      'START MISSION  →',
      {
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    button.on('pointerover', () => {
      button.setFillStyle(0x24a5ff);
      button.setScale(1.05);
      buttonText.setScale(1.05);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x1687d9);
      button.setScale(1);
      buttonText.setScale(1);
    });

    button.on('pointerdown', () => {
      this.scene.start('BriefingScene');
    });

    this.add.text(
      500, 625,
      'EXPLORE  •  SURVIVE  •  DISCOVER',
      {
        fontSize: '13px',
        color: '#aab8ca',
        letterSpacing: 3
      }
    ).setOrigin(0.5);
  }
}


// ======================================
// MISSION BRIEFING
// ======================================

class BriefingScene extends Phaser.Scene {
  constructor() {
    super('BriefingScene');
  }

  create() {
    this.add.rectangle(
      0, 0, 1000, 650, 0x080e1c
    ).setOrigin(0);

    this.add.text(
      500, 75,
      'MISSION BRIEFING',
      {
        fontSize: '42px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.add.text(
      500, 135,
      'LUNAR EXPEDITION 01',
      {
        fontSize: '20px',
        color: '#65c5ff',
        letterSpacing: 3
      }
    ).setOrigin(0.5);

    this.add.text(
      500, 205,
      'Welcome, Commander!',
      {
        fontSize: '29px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.add.text(
      500, 295,
      'Your mission is to establish and maintain a lunar outpost.\n\n' +
      'Manage essential resources, protect your crew,\n' +
      'explore the lunar surface and collect scientific samples.\n\n' +
      'Every decision affects the survival of your astronauts.',
      {
        fontSize: '17px',
        color: '#cbd8e8',
        align: 'center',
        lineSpacing: 6
      }
    ).setOrigin(0.5);

    this.add.text(
      500, 435,
      'MISSION OBJECTIVES',
      {
        fontSize: '20px',
        color: '#65c5ff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.add.text(
      500, 490,
      '01   Maintain life-support resources\n' +
      '02   Protect the astronauts\n' +
      '03   Explore and collect lunar samples',
      {
        fontSize: '17px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 9
      }
    ).setOrigin(0.5);

    // Begin exploration button
    const launchButton = this.add.rectangle(
      500, 560, 260, 55, 0x1687d9
    );

    launchButton.setStrokeStyle(2, 0x80d5ff);
    launchButton.setInteractive({ useHandCursor: true });

    this.add.text(
      500, 560,
      'BEGIN EXPLORATION',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    launchButton.on('pointerover', () => {
      launchButton.setFillStyle(0x24a5ff);
    });

    launchButton.on('pointerout', () => {
      launchButton.setFillStyle(0x1687d9);
    });

    launchButton.on('pointerdown', () => {
      this.scene.start('ExplorationScene');
    });

    // Return to menu button
    const backButton = this.add.rectangle(
      500, 620, 200, 40, 0x34485c
    );

    backButton.setInteractive({ useHandCursor: true });

    this.add.text(
      500, 620,
      'RETURN TO MENU',
      {
        fontSize: '14px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}


// ======================================
// LUNAR EXPLORATION SCENE
// ======================================

class ExplorationScene extends Phaser.Scene {
  constructor() {
    super('ExplorationScene');
  }

  create() {
    const W = 1000;
    const H = 650;

    // ==================================
    // LUNAR ENVIRONMENT
    // ==================================

    this.add.rectangle(
      0, 0, W, H, 0x171c23
    ).setOrigin(0);

    // Lunar regolith texture
    for (let i = 0; i < 230; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(65, H);

      this.add.circle(
        x,
        y,
        Phaser.Math.Between(1, 3),
        0x89909a,
        Phaser.Math.FloatBetween(0.08, 0.3)
      );
    }

    // Decorative small rocks (visual only)
    for (let i = 0; i < 45; i++) {
      const x = Phaser.Math.Between(20, 960);
      const y = Phaser.Math.Between(100, 620);

      this.add.ellipse(
        x,
        y,
        Phaser.Math.Between(8, 22),
        Phaser.Math.Between(5, 15),
        0x555e69
      );
    }

    // ==================================
    // SUNLIT RESEARCH OUTPOST
    // ==================================

    this.add.ellipse(
      170, 245, 310, 260, 0xa1a5a5, 0.12
    );

    // Habitat
    this.add.rectangle(
      150, 220, 115, 75, 0x8797a5
    ).setStrokeStyle(3, 0xd5e1e8);

    this.add.rectangle(
      150, 220, 85, 52, 0x33485b
    );

    this.add.text(
      150, 168,
      'LUNAR HABITAT',
      {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Habitat entrance
    this.add.rectangle(
      208, 245, 12, 28, 0x1c2937
    );

    // Solar panels
    for (let i = 0; i < 3; i++) {
      const panelX = 100 + i * 75;

      const panel = this.add.rectangle(
        panelX, 340, 57, 32, 0x164d79
      );

      panel.setStrokeStyle(2, 0x7ab9e8);

      for (let j = 0; j < 3; j++) {
        this.add.line(
          panelX, 340,
          -20 + j * 20, -15,
          -20 + j * 20, 15,
          0x9dc9e8
        );
      }
    }

    this.add.text(
      175, 380,
      'SOLAR ARRAY',
      {
        fontSize: '12px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);


    // ==================================
    // SHADOWED CRATER
    // ==================================

    this.add.ellipse(
      790, 385, 350, 300, 0x858b91
    );

    this.add.ellipse(
      790, 385, 290, 240, 0x101722
    );

    this.add.ellipse(
      790, 385, 210, 170, 0x070b12
    );

    this.add.text(
      790, 365,
      'PERMANENTLY SHADOWED\nREGION',
      {
        fontSize: '15px',
        color: '#9cb7d2',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.add.text(
      790, 420,
      'WATER ICE RESEARCH ZONE',
      {
        fontSize: '11px',
        color: '#6faee6'
      }
    ).setOrigin(0.5);

    this.add.text(
      790, 235,
      '⚠ EXTREME COLD',
      {
        fontSize: '14px',
        color: '#ffad62',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);


    // ==================================
    // ROCK COLLISION TEXTURE
    // ==================================

    // Generate a reusable rock texture for physics obstacles.
    const rockGraphics = this.make.graphics({ x: 0, y: 0, add: false });

    rockGraphics.fillStyle(0x434b55, 1);
    rockGraphics.fillEllipse(22, 16, 42, 30);

    rockGraphics.lineStyle(2, 0x69727d, 1);
    rockGraphics.strokeEllipse(22, 16, 42, 30);

    rockGraphics.generateTexture('astroquestRock', 44, 32);
    rockGraphics.destroy();


    // ==================================
    // PHYSICS OBSTACLES
    // ==================================

    this.obstacles = this.physics.add.staticGroup();

    const obstaclePositions = [
      [360, 210],
      [425, 310],
      [340, 455],
      [540, 160],
      [585, 495],
      [470, 555]
    ];

    obstaclePositions.forEach(([x, y]) => {
      const rock = this.obstacles.create(
        x, y, 'astroquestRock'
      );

      rock.setDisplaySize(44, 32);

      // Circular collision area, slightly smaller than the rock graphic.
      rock.body.setCircle(15);
      rock.refreshBody();
    });


    // ==================================
    // ASTRONAUT VISUAL
    // ==================================

    // The astronaut graphics use LOCAL coordinates inside the container.
    // This keeps the visual aligned with the physics body.

    const astronautBody = this.add.circle(
      0, 0, 17, 0xe5e9ed
    );

    astronautBody.setStrokeStyle(3, 0x5d758a);

    const helmet = this.add.circle(
      0, -9, 9, 0x64b6e9
    );

    helmet.setStrokeStyle(2, 0xffffff);

    const backpack = this.add.rectangle(
      -16, 6, 9, 16, 0xb4a77d
    );

    this.player = this.add.container(
      275, 275,
      [backpack, astronautBody, helmet]
    );


    // ==================================
    // ASTRONAUT PHYSICS BODY
    // ==================================

    // This invisible circle handles movement and collision.
    // It is separate from the visual container.

    this.playerBody = this.add.circle(
      275, 275, 12, 0xffffff, 0
    );

    this.physics.add.existing(this.playerBody);

    this.playerBody.body.setCircle(12);
    this.playerBody.body.setCollideWorldBounds(true);
    this.playerBody.body.setMaxVelocity(130, 130);

    this.playerBody.setVisible(false);

    this.playerSpeed = 130;

    // Actual collision between astronaut physics body and static rocks.
    this.physics.add.collider(
      this.playerBody,
      this.obstacles
    );


    // ==================================
    // KEYBOARD CONTROLS
    // ==================================

    this.keys = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D'
    });

    this.cursors = this.input.keyboard.createCursorKeys();


    // ==================================
    // SCIENTIFIC INFORMATION HUD
    // ==================================

    this.add.rectangle(
      500, 30, 1000, 60, 0x080e1c, 0.96
    );

    this.add.text(
      20, 18,
      'ASTROQUEST | LUNAR EXPEDITION 01',
      {
        fontSize: '17px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );

    this.add.text(
      690, 18,
      'GRAVITY: 1.62 m/s²',
      {
        fontSize: '15px',
        color: '#80ceff'
      }
    );

    this.statusText = this.add.text(
      20, 590,
      'STATUS: EXPLORING SUNLIT TERRAIN',
      {
        fontSize: '14px',
        color: '#a8e3b3',
        backgroundColor: '#101923',
        padding: { x: 10, y: 8 }
      }
    );

    this.add.text(
      20, 625,
      'WASD / ARROW KEYS: MOVE ASTRONAUT',
      {
        fontSize: '12px',
        color: '#c1cbd5'
      }
    );

    this.add.text(
      700, 625,
      'LUNAR SOUTH POLE',
      {
        fontSize: '12px',
        color: '#c1cbd5'
      }
    );

    this.add.text(
      20, 78,
      'OBJECTIVE: Explore the lunar surface',
      {
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#263746',
        padding: { x: 8, y: 6 }
      }
    );

    this.add.text(
      20, 110,
      'Find and investigate the shadowed crater.',
      {
        fontSize: '12px',
        color: '#d1dbe4'
      }
    );
  }


  // ==================================
  // ASTRONAUT MOVEMENT AND HUD UPDATE
  // ==================================

  update() {
    if (!this.playerBody || !this.playerBody.body) {
      return;
    }

    let vx = 0;
    let vy = 0;

    // Horizontal movement
    if (this.keys.left.isDown || this.cursors.left.isDown) {
      vx = -1;
    }

    if (this.keys.right.isDown || this.cursors.right.isDown) {
      vx = 1;
    }

    // Vertical movement
    if (this.keys.up.isDown || this.cursors.up.isDown) {
      vy = -1;
    }

    if (this.keys.down.isDown || this.cursors.down.isDown) {
      vy = 1;
    }

    // Normalize diagonal movement
    const direction = new Phaser.Math.Vector2(vx, vy);

    if (direction.length() > 0) {
      direction.normalize();
    }

    // Apply velocity to the invisible physics body
    this.playerBody.body.setVelocity(
      direction.x * this.playerSpeed,
      direction.y * this.playerSpeed
    );

    // Attach astronaut graphics to the physics body's position
    this.player.setPosition(
      this.playerBody.x,
      this.playerBody.y
    );


    // ==================================
    // SHADOWED REGION DETECTION
    // ==================================

    const x = this.playerBody.x;
    const y = this.playerBody.y;

    const dx = (x - 790) / 145;
    const dy = (y - 385) / 120;

    const insideCrater = (dx * dx) + (dy * dy) < 1;

    if (insideCrater) {
      this.statusText.setText(
        'WARNING: ENTERING SHADOWED REGION | EXTREME COLD'
      );

      this.statusText.setColor('#ffad62');
    } else {
      this.statusText.setText(
        'STATUS: EXPLORING SUNLIT TERRAIN'
      );

      this.statusText.setColor('#a8e3b3');
    }
  }
}


// ======================================
// GAME CONFIGURATION
// ======================================

const config = {
  type: Phaser.AUTO,

  width: 1000,
  height: 650,

  parent: 'game-container',

  backgroundColor: '#080e1c',

  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        x: 0,
        y: 0
      },
      debug: false
    }
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: [
    MenuScene,
    BriefingScene,
    ExplorationScene
  ]
};

// Start ASTROQUEST
new Phaser.Game(config);