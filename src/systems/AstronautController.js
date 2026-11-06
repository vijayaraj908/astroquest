import Phaser from 'phaser';

export default class AstronautController {
  constructor(scene) {
    this.scene = scene;
    this.speed = 130;
  }

  create() {
    const scene = this.scene;

    // Generate reusable rock texture.
    const rockGraphics = scene.make.graphics({
      x: 0,
      y: 0,
      add: false
    });

    rockGraphics.fillStyle(0x434b55, 1);
    rockGraphics.fillEllipse(22, 16, 42, 30);

    rockGraphics.lineStyle(2, 0x69727d, 1);
    rockGraphics.strokeEllipse(22, 16, 42, 30);

    rockGraphics.generateTexture('astroquestRock', 44, 32);
    rockGraphics.destroy();

    // Static rock obstacles.
    this.obstacles = scene.physics.add.staticGroup();

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
      rock.body.setCircle(15);
      rock.refreshBody();
    });

    // Astronaut visual.
    const astronautBody = scene.add.circle(
      0, 0, 17, 0xe5e9ed
    );

    astronautBody.setStrokeStyle(3, 0x5d758a);

    const helmet = scene.add.circle(
      0, -9, 9, 0x64b6e9
    );

    helmet.setStrokeStyle(2, 0xffffff);

    const backpack = scene.add.rectangle(
      -16, 6, 9, 16, 0xb4a77d
    );

    this.player = scene.add.container(
      275, 275,
      [backpack, astronautBody, helmet]
    );

    // Invisible physics body.
    this.playerBody = scene.add.circle(
      275, 275, 12, 0xffffff, 0
    );

    scene.physics.add.existing(this.playerBody);

    this.playerBody.body.setCircle(12);
    this.playerBody.body.setCollideWorldBounds(true);
    this.playerBody.body.setMaxVelocity(130, 130);

    this.playerBody.setVisible(false);

    scene.physics.add.collider(
      this.playerBody,
      this.obstacles
    );

    // Keyboard controls.
    this.keys = scene.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D'
    });

    this.cursors = scene.input.keyboard.createCursorKeys();

    this.interactKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    this.escapeKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
  }

  update() {
    const scene = this.scene;

    if (!this.playerBody || !this.playerBody.body) {
      return;
    }

    let vx = 0;
    let vy = 0;

    if (this.keys.left.isDown || this.cursors.left.isDown) {
      vx = -1;
    }

    if (this.keys.right.isDown || this.cursors.right.isDown) {
      vx = 1;
    }

    if (this.keys.up.isDown || this.cursors.up.isDown) {
      vy = -1;
    }

    if (this.keys.down.isDown || this.cursors.down.isDown) {
      vy = 1;
    }

    // Normalize diagonal movement.
    const direction = new Phaser.Math.Vector2(vx, vy);

    if (direction.length() > 0) {
      direction.normalize();
    }

    this.playerBody.body.setVelocity(
      direction.x * this.speed,
      direction.y * this.speed
    );

    // Keep astronaut visual aligned with physics body.
    this.player.setPosition(
      this.playerBody.x,
      this.playerBody.y
    );

    // Shadowed region detection.
    const x = this.playerBody.x;
    const y = this.playerBody.y;

    const dx = (x - 790) / 145;
    const dy = (y - 385) / 120;

    const insideCrater = (dx * dx) + (dy * dy) < 1;

    if (insideCrater) {
      scene.hud.setStatus(
        'WARNING: ENTERING SHADOWED REGION | EXTREME COLD',
        '#ffad62'
      );
    } else {
      scene.hud.setStatus(
        'STATUS: EXPLORING SUNLIT TERRAIN',
        '#a8e3b3'
      );
    }
  }
}