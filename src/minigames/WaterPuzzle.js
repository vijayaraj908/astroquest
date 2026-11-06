
export default class WaterPuzzle {
  constructor(scene, onComplete, onCancel) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onCancel = onCancel;

    // Pipeline:
    // Source -> 0 -> 1 -> 2 -> 5 -> 8 -> Tank

    // Direction mapping:
    // 0 = North, 1 = East, 2 = South, 3 = West

    this.path = [0, 1, 2, 5, 8];

    // Correct pipe configurations.
    this.pipeDefinitions = {
      // Straight horizontal: West + East
      0: { connections: [1, 3] },

      // Straight horizontal: West + East
      1: { connections: [1, 3] },

      // Corner: West + South
      2: { connections: [2, 3] },

      // Straight vertical: North + South
      5: { connections: [0, 2] },

      // Corner: North + East
      8: { connections: [0, 1] }
    };

    // Initial scrambled rotations.
    this.rotations = {
      0: 1,
      1: 2,
      2: 3,
      5: 1,
      8: 2
    };

    this.tileSize = 66;
    this.gridX = 390;
    this.gridY = 245;

    this.objects = [];
    this.pipeGraphics = {};

    this.statusText = null;
    this.flowText = null;

    this.finished = false;
  }

  // ==================================
  // START PUZZLE
  // ==================================

  start() {
    const scene = this.scene;

    // Background overlay
    this.add(
      scene.add.rectangle(
        500, 325, 1000, 650,
        0x050a12, 0.9
      )
        .setDepth(1000)
        .setInteractive()
    );

    // Main puzzle panel
    this.add(
      scene.add.rectangle(
        500, 325, 680, 490,
        0x172638
      )
        .setStrokeStyle(3, 0x38bdf8)
        .setDepth(1001)
    );

    this.addText(
      500, 115,
      'WATER RECOVERY SYSTEM',
      24, '#7dd3fc'
    );

    this.addText(
      500, 150,
      'PIPELINE RECONNECTION CHALLENGE',
      14, '#ffffff'
    );

    this.addText(
      500, 180,
      'Rotate the pipes to connect the source to the recovery tank.',
      13, '#a9bacb'
    );

    // Source label
    this.addText(
      300, 220,
      'WATER SOURCE',
      12, '#38bdf8'
    );

    // Recovery tank label
    this.addText(
      700, 480,
      'RECOVERY TANK',
      12, '#38bdf8'
    );

    // ==================================
    // PIPE GRID
    // ==================================

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {

        const index = row * 3 + col;

        const x = this.gridX + col * 80;
        const y = this.gridY + row * 80;

        const tile = this.scene.add.rectangle(
          x, y,
          this.tileSize,
          this.tileSize,
          0x243b50
        )
          .setStrokeStyle(2, 0x49677d)
          .setDepth(1002);

        this.add(tile);

        const graphics = this.scene.add.graphics()
          .setDepth(1003);

        this.pipeGraphics[index] = graphics;

        this.add(graphics);

        // Only actual pipe positions are interactive.
        if (this.pipeDefinitions[index]) {

          tile.setInteractive({
            useHandCursor: true
          });

          tile.on('pointerdown', () => {

            if (this.finished) return;

            // Rotate clockwise by 90 degrees.
            this.rotations[index] =
              (this.rotations[index] + 1) % 4;

            this.renderPipe(index);

            this.checkSolution();
          });

        } else {

          this.addText(
            x, y,
            '—',
            18, '#52687a'
          );
        }
      }
    }

    // ==================================
    // WATER SOURCE AND TANK
    // ==================================

    this.addText(
      300, 245,
      '●',
      28, '#38bdf8'
    );

    this.addText(
      700, 405,
      '●',
      28, '#4ade80'
    );

    // Render initial pipe orientations.
    this.path.forEach(index => {
      this.renderPipe(index);
    });

    // ==================================
    // STATUS
    // ==================================

    this.flowText = this.addText(
      500, 500,
      'WATER FLOW: DISCONNECTED',
      14, '#facc15'
    );

    this.statusText = this.addText(
      500, 525,
      'ROTATE THE PIPE SECTIONS TO RESTORE FLOW',
      12, '#ffffff'
    );

    // ==================================
    // CANCEL BUTTON
    // ==================================

    const cancelButton = this.scene.add.rectangle(
      500, 570, 150, 36,
      0x713b42
    )
      .setStrokeStyle(2, 0xfca5a5)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(cancelButton);

    this.addText(
      500, 570,
      'CANCEL',
      13, '#ffffff'
    );

    cancelButton.on('pointerdown', () => {

      if (this.finished) return;

      this.destroy();

      if (this.onCancel) {
        this.onCancel();
      }
    });
  }

  // ==================================
  // GET PIPE CONNECTIONS
  // ==================================

  getConnections(index) {
    const definition = this.pipeDefinitions[index];

    if (!definition) return [];

    const rotation = this.rotations[index];

    return definition.connections.map(direction => {
      return (direction + rotation) % 4;
    });
  }

  // ==================================
  // DRAW PIPE
  // ==================================

  renderPipe(index) {
    const graphics = this.pipeGraphics[index];

    if (!graphics) return;

    graphics.clear();

    const col = index % 3;
    const row = Math.floor(index / 3);

    const x = this.gridX + col * 80;
    const y = this.gridY + row * 80;

    const connections = this.getConnections(index);

    graphics.lineStyle(
      9, 0x38bdf8, 1
    );

    graphics.fillStyle(
      0x38bdf8, 1
    );

    // Draw each pipe arm.
    connections.forEach(direction => {

      let endX = x;
      let endY = y;

      if (direction === 0) endY -= 29;
      if (direction === 1) endX += 29;
      if (direction === 2) endY += 29;
      if (direction === 3) endX -= 29;

      graphics.lineBetween(
        x, y,
        endX, endY
      );
    });

    graphics.fillCircle(
      x, y, 7
    );

    graphics.lineStyle(
      2, 0xc5eaff, 1
    );

    graphics.strokeCircle(
      x, y, 12
    );
  }

  // ==================================
  // VALIDATE PIPE CONNECTIONS
  // ==================================

  checkSolution() {

    const hasConnection = (pipeIndex, direction) => {
      return this.getConnections(pipeIndex).includes(direction);
    };

    // Every connection must match its neighbour.
    const connectionsValid =

      // Water source -> Pipe 0
      hasConnection(0, 3) &&

      // Pipe 0 -> Pipe 1
      hasConnection(0, 1) &&
      hasConnection(1, 3) &&

      // Pipe 1 -> Pipe 2
      hasConnection(1, 1) &&
      hasConnection(2, 3) &&

      // Pipe 2 -> Pipe 5
      hasConnection(2, 2) &&
      hasConnection(5, 0) &&

      // Pipe 5 -> Pipe 8
      hasConnection(5, 2) &&
      hasConnection(8, 0) &&

      // Pipe 8 -> Recovery tank
      hasConnection(8, 1);

    if (!connectionsValid) {

      this.flowText.setText(
        'WATER FLOW: DISCONNECTED'
      );

      this.flowText.setColor('#facc15');

      this.statusText.setText(
        'CHECK PIPE CONNECTIONS AND TRY AGAIN'
      );

      return;
    }

    // ==================================
    // PUZZLE COMPLETED
    // ==================================

    this.finished = true;

    this.flowText.setText(
      'WATER FLOW: RESTORED'
    );

    this.flowText.setColor('#4ade80');

    this.statusText.setText(
      'PIPELINE CONNECTED! RECOVERY SYSTEM ONLINE.'
    );

    this.statusText.setColor('#4ade80');

    this.scene.time.delayedCall(1200, () => {

      this.destroy();

      if (this.onComplete) {
        this.onComplete();
      }
    });
  }

  // ==================================
  // ADD OBJECT
  // ==================================

  add(object) {
    this.objects.push(object);
    return object;
  }

  // ==================================
  // ADD TEXT
  // ==================================

  addText(x, y, value, size, color) {

    const text = this.scene.add.text(
      x, y, value,
      {
        fontFamily: 'monospace',
        fontSize: `${size}px`,
        color,
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(1004);

    this.objects.push(text);

    return text;
  }

  // ==================================
  // CLEANUP
  // ==================================

  destroy() {

    this.objects.forEach(object => {

      if (object && object.destroy) {
        object.destroy();
      }

    });

    this.objects = [];
    this.pipeGraphics = {};
  }
}
