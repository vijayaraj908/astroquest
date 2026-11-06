
export default class SolarPuzzle {
  constructor(scene, onComplete, onCancel) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onCancel = onCancel;

    this.panelAngles = [0, 0, 0];
    this.targetAngles = [90, 180, 270];

    this.objects = [];
    this.panelGraphics = [];
    this.statusText = null;
    this.finished = false;
  }

  start() {
    const scene = this.scene;

    // Dark overlay
    this.add(
      scene.add.rectangle(
        500, 325, 1000, 650, 0x050a12, 0.88
      ).setDepth(1000).setInteractive()
    );

    // Main puzzle panel
    this.add(
      scene.add.rectangle(
        500, 325, 650, 470, 0x172638
      ).setStrokeStyle(3, 0x56b4e9).setDepth(1001)
    );

    this.addText(
      500, 125,
      'SOLAR ARRAY CALIBRATION',
      25, '#7dd3fc'
    );

    this.addText(
      500, 160,
      'Rotate each panel to match its target orientation.',
      15, '#ffffff'
    );

    this.addText(
      500, 195,
      'Each click rotates the panel by 90 degrees.',
      13, '#a9bacb'
    );

    const rowY = [265, 345, 425];

    this.panelAngles.forEach((angle, index) => {
      const y = rowY[index];

      this.addText(
        300, y - 22,
        `SOLAR PANEL ${index + 1}`,
        14, '#ffffff'
      );

      this.addText(
        465, y - 22,
        `TARGET: ${this.targetAngles[index]}°`,
        13, '#7dd3fc'
      );

      const graphics = this.scene.add.graphics()
        .setDepth(1003);

      this.panelGraphics.push(graphics);
      this.objects.push(graphics);

      const rotateButton = this.scene.add.rectangle(
        700, y, 100, 38, 0x176b91
      )
        .setStrokeStyle(2, 0x7dd3fc)
        .setDepth(1003)
        .setInteractive({ useHandCursor: true });

      this.add(rotateButton);

      const buttonLabel = this.addText(
        700, y,
        'ROTATE',
        13, '#ffffff'
      );

      rotateButton.on('pointerdown', () => {
        if (this.finished) return;

        this.panelAngles[index] =
          (this.panelAngles[index] + 90) % 360;

        this.renderPanel(index);
        this.checkSolution();
      });

      this.renderPanel(index);
    });

    this.statusText = this.addText(
      500, 505,
      'ALIGN ALL THREE PANELS TO CONTINUE',
      14, '#facc15'
    );

    const cancelButton = scene.add.rectangle(
      500, 555, 150, 38, 0x713b42
    )
      .setStrokeStyle(2, 0xfca5a5)
      .setDepth(1003)
      .setInteractive({ useHandCursor: true });

    this.add(cancelButton);

    this.addText(
      500, 555,
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

  renderPanel(index) {
    const graphics = this.panelGraphics[index];

    if (!graphics) return;

    graphics.clear();

    const x = 300;
    const y = [265, 345, 425][index];

    graphics.lineStyle(4, 0x38bdf8, 1);
    graphics.strokeRect(x - 32, y - 20, 64, 40);

    graphics.lineStyle(2, 0xc5eaff, 1);

    const angle = this.panelAngles[index] * Math.PI / 180;
    const dx = Math.cos(angle) * 26;
    const dy = Math.sin(angle) * 26;

    graphics.lineBetween(
      x - dx, y - dy,
      x + dx, y + dy
    );

    graphics.fillStyle(0xfacc15, 1);
    graphics.fillCircle(x, y, 5);

    const aligned =
      this.panelAngles[index] === this.targetAngles[index];

    graphics.lineStyle(
      3,
      aligned ? 0x4ade80 : 0xfacc15,
      1
    );

    graphics.strokeCircle(x, y, 29);
  }

  checkSolution() {
    const solved = this.panelAngles.every(
      (angle, index) => angle === this.targetAngles[index]
    );

    if (!solved) return;

    this.finished = true;

    this.statusText.setText(
      'CALIBRATION SUCCESSFUL! SOLAR ARRAY ONLINE.'
    );

    this.statusText.setColor('#4ade80');

    this.scene.time.delayedCall(1200, () => {
      this.destroy();

      if (this.onComplete) {
        this.onComplete();
      }
    });
  }

  add(object) {
    this.objects.push(object);
    return object;
  }

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

  destroy() {
    this.objects.forEach(object => {
      if (object && object.destroy) {
        object.destroy();
      }
    });

    this.objects = [];
    this.panelGraphics = [];
  }
}
