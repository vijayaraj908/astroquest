
import Phaser from 'phaser';

import ResourceManager from '../systems/ResourceManager.js';
import ResourceHUD from '../ui/ResourceHUD.js';
import AstronautController from '../systems/AstronautController.js';
import FacilityManager from '../systems/FacilityManager.js';
import ExplorationHUD from '../ui/ExplorationHUD.js';

export default class ExplorationScene extends Phaser.Scene {
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
    // CREATE GAME SYSTEMS
    // ==================================

    // 1. Astronaut movement and collisions
    this.astronaut = new AstronautController(this);
    this.astronaut.create();

    // 2. Exploration HUD
    this.hud = new ExplorationHUD(this);
    this.hud.create();

    // 3. Resource management
    this.resourceManager = new ResourceManager();

    // 4. Resource dashboard
    this.resourceHUD = new ResourceHUD(
      this,
      this.resourceManager
    );

    this.resourceHUD.create();

    // 5. Facility management
    this.facilityManager = new FacilityManager(
      this,
      this.resourceManager,
      this.resourceHUD
    );

    this.facilityManager.create();
  } // End of create()

  update() {
    if (!this.astronaut || !this.astronaut.playerBody) {
      return;
    }

    // ESC closes the facility console
    if (
      this.facilityManager.isOpen &&
      Phaser.Input.Keyboard.JustDown(
        this.astronaut.escapeKey
      )
    ) {
      this.facilityManager.close();
      return;
    }

    // Freeze astronaut while console is open
    if (this.facilityManager.isOpen) {
      this.astronaut.playerBody.body.setVelocity(0, 0);
      return;
    }

    // Update movement and shadowed-region status
    this.astronaut.update();

    // Update facility proximity and interaction
    this.facilityManager.update();
  }
}
