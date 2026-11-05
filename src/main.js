
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

    // Background
    this.add.rectangle(
      0, 0, width, height, 0x080e1c
    ).setOrigin(0);

    // Stars
    for (let i = 0; i < 150; i++) {

      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, 430);

      const star = this.add.circle(
        x, y,
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

    // Earth in the background
    this.add.circle(825, 145, 57, 0x2475b8, 0.9);
    this.add.circle(825, 145, 48, 0x173f78, 0.9);

    this.add.ellipse(
      810, 130, 27, 15, 0x56a66c, 0.8
    );

    this.add.ellipse(
      840, 158, 22, 12, 0x56a66c, 0.8
    );

    // Moon surface
    this.add.ellipse(
      500, 590, 1400, 350, 0x555d6b
    );

    this.add.ellipse(
      500, 615, 1300, 240, 0x343d4d
    );

    // Moon craters
    this.add.ellipse(140, 545, 120, 35, 0x343b49);
    this.add.ellipse(820, 565, 160, 42, 0x303847);
    this.add.ellipse(560, 600, 90, 25, 0x222b3a);

    // Mission label
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

    // Main title
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

    // Subtitle
    this.add.text(
      500, 255,
      'JUNIOR ASTRONAUT MISSION TRAINER',
      {
        fontSize: '19px',
        color: '#91bde0',
        letterSpacing: 4
      }
    ).setOrigin(0.5);

    // Description
    this.add.text(
      500, 325,
      'Explore the Moon. Manage your crew. Survive the mission.',
      {
        fontSize: '17px',
        color: '#d3dce9'
      }
    ).setOrigin(0.5);

    // Start button background
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

    // Button hover effect
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

    // Start mission
    button.on('pointerdown', () => {
      this.scene.start('BriefingScene');
    });

    // Footer
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

    // Main heading
    this.add.text(
      500, 75,
      'MISSION BRIEFING',
      {
        fontSize: '42px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Mission name
    this.add.text(
      500, 135,
      'LUNAR EXPEDITION 01',
      {
        fontSize: '20px',
        color: '#65c5ff',
        letterSpacing: 3
      }
    ).setOrigin(0.5);

    // Welcome heading
    this.add.text(
      500, 205,
      'Welcome, Commander!',
      {
        fontSize: '29px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Mission description
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

    // Objectives heading
    this.add.text(
      500, 435,
      'MISSION OBJECTIVES',
      {
        fontSize: '20px',
        color: '#65c5ff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Objectives
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

    // Return button
    const backButton = this.add.rectangle(
      500, 590, 220, 55, 0x1687d9
    );

    backButton.setInteractive({
      useHandCursor: true
    });

    this.add.text(
      500, 590,
      'RETURN TO MENU',
      {
        fontSize: '17px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x24a5ff);
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x1687d9);
    });

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
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

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: [
    MenuScene,
    BriefingScene
  ]
};


// Start ASTROQUEST
new Phaser.Game(config);
