import Phaser from 'phaser';

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

export default MenuScene;