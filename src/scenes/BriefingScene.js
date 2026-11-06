import Phaser from 'phaser';

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
      'Inspect the Lunar Command Center and seven operational facilities.\n' +
      'Understand how each module supports production,\n' +
      'crew survival and lunar expedition readiness.\n\n' +
      'Your first objective is to understand the entire base.',
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
      '01   Locate all eight lunar base facilities\n' +
      '02   Inspect facility functions and resources\n' +
      '03   Complete the lunar base orientation',
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
      'ENTER LUNAR BASE',
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

export default BriefingScene;