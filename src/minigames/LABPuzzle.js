
export default class LABPuzzle {
  constructor(scene, onComplete, onCancel) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onCancel = onCancel;

    this.objects = [];
    this.finished = false;

    this.catalystReady = false;
    this.waterLevel = 0;
    this.oxygenLevel = 0;

    this.targetWater = 2;
    this.targetOxygen = 2;

    this.waterText = null;
    this.oxygenText = null;
    this.statusText = null;
    this.progressText = null;
    this.catalystButton = null;
    this.synthesisButton = null;
  }

  start() {
    const scene = this.scene;

    // Background
    this.add(
      scene.add.rectangle(
        500, 325, 1000, 650,
        0x050a12, 0.92
      )
        .setDepth(1000)
        .setInteractive()
    );

    // Main panel
    this.add(
      scene.add.rectangle(
        500, 325, 700, 590,
        0x172638
      )
        .setStrokeStyle(3, 0xc5a3ff)
        .setDepth(1001)
    );

    this.addText(
      500, 110,
      'SCIENCE LAB - CHEMICAL SYNTHESIS',
      22, '#c5a3ff'
    );

    this.addText(
      500, 145,
      'FUEL CELL MANUFACTURING PROTOCOL',
      13, '#ffffff'
    );

    this.addText(
      500, 180,
      'Prepare the catalyst and measure the reactants.',
      12, '#a9bacb'
    );

    // Catalyst preparation
    this.addText(
      500, 225,
      'STEP 1 - CATALYST PREPARATION',
      13, '#ffffff'
    );

    this.catalystButton = scene.add.rectangle(
      500, 260, 250, 42,
      0x4c3677
    )
      .setStrokeStyle(2, 0xc5a3ff)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(this.catalystButton);

    this.catalystLabel = this.addText(
      500, 260,
      'PREPARE CATALYST',
      13, '#ffffff'
    );

    this.catalystButton.on('pointerdown', () => {
      if (this.finished || this.catalystReady) return;

      this.catalystReady = true;

      this.catalystButton.setFillStyle(0x145b48);
      this.catalystButton.setStrokeStyle(2, 0x4ade80);

      this.catalystLabel.setText('CATALYST READY');
      this.catalystLabel.setColor('#4ade80');

      this.updateProgress();
    });

    // Water measurement
    this.addText(
      500, 325,
      'STEP 2 - REACTANT MEASUREMENT',
      13, '#ffffff'
    );

    this.addText(
      330, 365,
      'WATER UNITS',
      12, '#38bdf8'
    );

    this.addText(
      670, 365,
      'OXYGEN UNITS',
      12, '#4ade80'
    );

    // Water controls
    this.createControl(
      330, 415,
      -1,
      () => this.adjustWater(-1),
      0x713b42
    );

    this.createControl(
      405, 415,
      1,
      () => this.adjustWater(1),
      0x176b55
    );

    // Oxygen controls
    this.createControl(
      595, 415,
      -1,
      () => this.adjustOxygen(-1),
      0x713b42
    );

    this.createControl(
      670, 415,
      1,
      () => this.adjustOxygen(1),
      0x176b55
    );

    this.waterText = this.addText(
      367, 465,
      '0 / 2',
      17, '#38bdf8'
    );

    this.oxygenText = this.addText(
      633, 465,
      '0 / 2',
      17, '#4ade80'
    );

    // Synthesis activation
    this.addText(
      500, 505,
      'STEP 3 - SYNTHESIS ACTIVATION',
      12, '#ffffff'
    );

    this.synthesisButton = scene.add.rectangle(
      500, 545, 240, 38,
      0x405363
    )
      .setStrokeStyle(2, 0x8b9baa)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(this.synthesisButton);

    this.synthesisLabel = this.addText(
      500, 545,
      'START SYNTHESIS',
      13, '#ffffff'
    );

    this.synthesisButton.on('pointerdown', () => {
      this.completeSynthesis();
    });

    this.progressText = this.addText(
      500, 590,
      'PROGRESS: 0 / 3',
      12, '#7dd3fc'
    );

    this.statusText = this.addText(
      500, 615,
      'LABORATORY STANDBY',
      11, '#facc15'
    );

    // Cancel
    const cancel = scene.add.rectangle(
      850, 105, 100, 30,
      0x713b42
    )
      .setStrokeStyle(1, 0xfca5a5)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(cancel);

    this.addText(
      850, 105,
      'CANCEL',
      11, '#ffffff'
    );

    cancel.on('pointerdown', () => {
      if (this.finished) return;

      this.destroy();

      if (this.onCancel) {
        this.onCancel();
      }
    });

    this.updateProgress();
  }

  createControl(x, y, symbol, callback, color) {
    const button = this.scene.add.rectangle(
      x, y, 45, 35, color
    )
      .setStrokeStyle(1, 0xffffff)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(button);

    this.addText(
      x, y,
      symbol > 0 ? '+' : '-',
      19, '#ffffff'
    );

    button.on('pointerdown', () => {
      if (this.finished) return;
      callback();
    });
  }

  adjustWater(amount) {
    if (this.finished) return;

    this.waterLevel = Math.max(
      0,
      Math.min(4, this.waterLevel + amount)
    );

    this.updateProgress();
  }

  adjustOxygen(amount) {
    if (this.finished) return;

    this.oxygenLevel = Math.max(
      0,
      Math.min(4, this.oxygenLevel + amount)
    );

    this.updateProgress();
  }

  updateProgress() {
    if (this.waterText) {
      this.waterText.setText(
        `${this.waterLevel} / ${this.targetWater}`
      );

      this.waterText.setColor(
        this.waterLevel === this.targetWater
          ? '#4ade80'
          : '#38bdf8'
      );
    }

    if (this.oxygenText) {
      this.oxygenText.setText(
        `${this.oxygenLevel} / ${this.targetOxygen}`
      );

      this.oxygenText.setColor(
        this.oxygenLevel === this.targetOxygen
          ? '#4ade80'
          : '#4ade80'
      );
    }

    let completed = 0;

    if (this.catalystReady) completed++;
    if (this.waterLevel === this.targetWater) completed++;
    if (this.oxygenLevel === this.targetOxygen) completed++;

    this.progressText.setText(
      `PROGRESS: ${completed} / 3`
    );

    if (completed === 3) {
      this.statusText.setText(
        'REACTANTS READY - SYNTHESIS CAN BEGIN'
      );

      this.statusText.setColor('#4ade80');

      this.synthesisButton.setFillStyle(0x176b55);
      this.synthesisButton.setStrokeStyle(2, 0x4ade80);
    } else {
      this.statusText.setText(
        'PREPARE CATALYST AND SET REACTANT LEVELS'
      );

      this.statusText.setColor('#facc15');
    }
  }

  completeSynthesis() {
    if (this.finished) return;

    if (
      !this.catalystReady ||
      this.waterLevel !== this.targetWater ||
      this.oxygenLevel !== this.targetOxygen
    ) {
      this.statusText.setText(
        'INCORRECT REACTANT CONFIGURATION!'
      );

      this.statusText.setColor('#f87171');
      return;
    }

    this.finished = true;

    this.synthesisButton.disableInteractive();

    this.synthesisButton.setFillStyle(0x145b48);

    this.synthesisLabel.setText(
      'SYNTHESIS SUCCESSFUL'
    );

    this.synthesisLabel.setColor('#4ade80');

    this.statusText.setText(
      'FUEL CELL MANUFACTURED SUCCESSFULLY!'
    );

    this.statusText.setColor('#4ade80');

    this.progressText.setText(
      'LABORATORY OPERATION COMPLETE'
    );

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
        fontStyle: 'bold',
        align: 'center'
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
  }
}
