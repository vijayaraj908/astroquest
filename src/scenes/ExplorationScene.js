
import Phaser from 'phaser';

import ResourceManager from '../systems/ResourceManager.js';
import CrewSurvivalManager from '../systems/CrewSurvivalManager.js';
import EmergencyManager from '../systems/EmergencyManager.js';
import ResourceHUD from '../ui/ResourceHUD.js';
import AstronautController from '../systems/AstronautController.js';
import FacilityManager from '../systems/FacilityManager.js';
import ExplorationHUD from '../ui/ExplorationHUD.js';

export default class ExplorationScene extends Phaser.Scene {
  constructor() {
    super('ExplorationScene');

    this.WORLD_WIDTH = 1800;
    this.WORLD_HEIGHT = 1200;
    this.MAP_OFFSET_X = 300;
    this.MAP_OFFSET_Y = 150;
  }

  create() {
    // ==================================
    // EXPANDED LUNAR WORLD
    // ==================================

    this.physics.world.setBounds(
      300, 0,
      this.WORLD_WIDTH-300,
      this.WORLD_HEIGHT
    );

    this.cameras.main.setBounds(
      0, 0,
      this.WORLD_WIDTH,
      this.WORLD_HEIGHT
    );

    this.add.rectangle(
      0, 0,
      this.WORLD_WIDTH,
      this.WORLD_HEIGHT,
      0x171c23
    ).setOrigin(0);

    // Lunar surface details.
    for (let i = 0; i < 550; i++) {
      const x = Phaser.Math.Between(10, this.WORLD_WIDTH - 10);
      const y = Phaser.Math.Between(10, this.WORLD_HEIGHT - 10);

      this.add.circle(
        x, y,
        Phaser.Math.Between(1, 3),
        0x89909a,
        Phaser.Math.FloatBetween(0.08, 0.3)
      );
    }

    // Lunar rocks.
    for (let i = 0; i < 125; i++) {
      const x = Phaser.Math.Between(20, this.WORLD_WIDTH - 20);
      const y = Phaser.Math.Between(100, this.WORLD_HEIGHT - 20);

      this.add.ellipse(
        x, y,
        Phaser.Math.Between(8, 24),
        Phaser.Math.Between(5, 16),
        0x555e69,
        0.85
      );
    }

    // ==================================
    // LUNAR HABITAT
    // ==================================

    const ox = this.MAP_OFFSET_X;
    const oy = this.MAP_OFFSET_Y;

    this.add.ellipse(
      170 + ox, 245 + oy,
      310, 260,
      0xa1a5a5, 0.12
    );

    this.add.rectangle(
      150 + ox, 220 + oy,
      115, 75,
      0x8797a5
    ).setStrokeStyle(3, 0xd5e1e8);

    this.add.rectangle(
      150 + ox, 220 + oy,
      85, 52,
      0x33485b
    );

    this.add.text(
      150 + ox, 168 + oy,
      'LUNAR HABITAT',
      {
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.add.rectangle(
      208 + ox, 245 + oy,
      12, 28,
      0x1c2937
    );

    // ==================================
    // SOLAR ARRAY
    // ==================================

    for (let i = 0; i < 3; i++) {
      const panelX = 100 + i * 75 + ox;

      const panel = this.add.rectangle(
        panelX, 340 + oy,
        57, 32,
        0x164d79
      );

      panel.setStrokeStyle(2, 0x7ab9e8);

      for (let j = 0; j < 3; j++) {
        this.add.line(
          panelX, 340 + oy,
          -20 + j * 20, -15,
          -20 + j * 20, 15,
          0x9dc9e8
        );
      }
    }

    this.add.text(
      175 + ox, 380 + oy,
      'SOLAR ARRAY',
      {
        fontSize: '13px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // ==================================
    // SHADOWED CRATER
    // ==================================

    this.add.ellipse(
      790 + ox, 385 + oy,
      350, 300,
      0x858b91
    );

    this.add.ellipse(
      790 + ox, 385 + oy,
      290, 240,
      0x101722
    );

    this.add.ellipse(
      790 + ox, 385 + oy,
      210, 170,
      0x070b12
    );

    this.add.text(
      790 + ox, 365 + oy,
      'PERMANENTLY SHADOWED\nREGION',
      {
        fontSize: '15px',
        color: '#9cb7d2',
        align: 'center',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.add.text(
      790 + ox, 420 + oy,
      'WATER ICE RESEARCH ZONE',
      {
        fontSize: '11px',
        color: '#6faee6'
      }
    ).setOrigin(0.5);

    this.add.text(
      790 + ox, 235 + oy,
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

    this.astronaut = new AstronautController(this);
    this.astronaut.create();

    this.hud = new ExplorationHUD(this);
    this.hud.create();

    this.resourceManager = new ResourceManager();

    // Initialize crew survival.
    this.crewSurvivalManager = new CrewSurvivalManager(
      this.resourceManager
    );

    // Initialize emergency management.
    this.emergencyManager = new EmergencyManager(
      this.resourceManager,
      this.crewSurvivalManager
    );

    this.resourceHUD = new ResourceHUD(
      this,
      this.resourceManager,
      this.crewSurvivalManager
    );

    this.resourceHUD.create();

    this.facilityManager = new FacilityManager(
      this,
      this.resourceManager,
      this.resourceHUD
    );

    this.facilityManager.create();

    // ==================================
    // CAMERA FOLLOW
    // ==================================

    this.cameras.main.startFollow(
      this.astronaut.playerBody,
      true,
      0.09,
      0.09
    );

    // Initial camera position.
    this.cameras.main.centerOn(
      this.astronaut.playerBody.x,
      this.astronaut.playerBody.y
    );

    // ==================================
    // MAP AND SIDEBAR SEPARATION
    // ==================================

    this.add.rectangle(
      270, 325, 4, 650,
      0x3d607b
    )
      .setScrollFactor(0)
      .setDepth(90);
  }

  // Hide fixed interface while a facility console
  // or mini-game is being displayed.
  beginFacilityConsole() {
  this.cameras.main.stopFollow();

  // Preserve the current camera position.
  this.hud.setVisible(false);
  this.resourceHUD.setVisible(false);
}

  // Restore the exploration interface and camera.
  endFacilityConsole() {
  this.hud.setVisible(true);
  this.resourceHUD.setVisible(true);

  this.cameras.main.startFollow(
    this.astronaut.playerBody,
    true,
    0.09,
    0.09
  );
}

 
  update() {
    if (!this.astronaut || !this.astronaut.playerBody) {
      return;
    }

    // PRIORITY 1:
    // If a mini-game is running, ESC cancels
    // the mini-game only. The facility panel stays open.
    if (this.facilityManager.miniGameManager.isRunning()) {
      this.astronaut.playerBody.body.setVelocity(0, 0);

      if (
        Phaser.Input.Keyboard.JustDown(
          this.astronaut.escapeKey
        )
      ) {
        this.facilityManager.miniGameManager.cancelActive();
      }

      return;
    }

    // PRIORITY 2:
    // If only the facility console is open,
    // ESC closes the facility console.
    if (this.facilityManager.isOpen) {
      this.astronaut.playerBody.body.setVelocity(0, 0);

      if (
        Phaser.Input.Keyboard.JustDown(
          this.astronaut.escapeKey
        )
      ) {
        this.facilityManager.close();
      }

      return;
    }

    // PRIORITY 3:
    // Normal lunar exploration.
    this.astronaut.update();
    this.facilityManager.update();
  }

}
