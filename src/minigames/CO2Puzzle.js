
export default class CO2Puzzle {
  constructor(scene, onComplete, onCancel) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onCancel = onCancel;

    this.objects = [];
    this.controls = [];
    this.finished = false;

    this.parameters = [
      {
        name: 'CO2 CAPTURE EFFICIENCY',
        value: 40,
        target: 75,
        unit: '%'
      },
      {
        name: 'AIRFLOW RATE',
        value: 70,
        target: 45,
        unit: '%'
      },
      {
        name: 'SCRUBBER BED TEMPERATURE',
        value: 35,
        target: 60,
        unit: '%'
      }
    ];

    this.statusText = null;
    this.progressText = null;
  }

  start() {
    const scene = this.scene;

    // Background overlay
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
        500, 325, 720, 470,
        0x142638
      )
        .setStrokeStyle(3, 0x80e09c)
        .setDepth(1001)
    );

    this.addText(
      500, 115,
      'CO2 SCRUBBER CALIBRATION',
      24, '#80e09c'
    );

    this.addText(
      500, 150,
      'ATMOSPHERIC PURIFICATION SYSTEM',
      14, '#ffffff'
    );

    this.addText(
      500, 185,
      'Adjust all three parameters to their target values.',
      13, '#a9bacb'
    );

    this.addText(
      500, 215,
      'Use + and - to calibrate the scrubber.',
      12, '#7dd3fc'
    );

    // Create parameter controls.
    const positions = [295, 385, 475];

    this.parameters.forEach((parameter, index) => {
      const y = positions[index];

      this.addText(
        500, y - 24,
        parameter.name,
        13, '#ffffff'
      );

      // Minus button
      const minus = scene.add.rectangle(
        330, y + 12, 55, 38,
        0x713b42
      )
        .setStrokeStyle(2, 0xfca5a5)
        .setDepth(1003)
        .setInteractive({
          useHandCursor: true
        });

      this.add(minus);

      this.addText(
        330, y + 12,
        '-',
        22, '#ffffff'
      );

      // Current value display
      const valueText = this.addText(
        500, y + 12,
        `${parameter.value}${parameter.unit}`,
        20, '#facc15'
      );

      // Plus button
      const plus = scene.add.rectangle(
        670, y + 12, 55, 38,
        0x176b55
      )
        .setStrokeStyle(2, 0x4ade80)
        .setDepth(1003)
        .setInteractive({
          useHandCursor: true
        });

      this.add(plus);

      this.addText(
        670, y + 12,
        '+',
        22, '#ffffff'
      );

      // Target information
      const targetText = this.addText(
        500, y + 42,
        `TARGET: ${parameter.target}${parameter.unit}`,
        11, '#7dd3fc'
      );

      this.controls.push({
        minus,
        plus,
        valueText,
        targetText
      });

      minus.on('pointerdown', () => {
        this.adjustValue(index, -5);
      });

      plus.on('pointerdown', () => {
        this.adjustValue(index, 5);
      });
    });

    // Progress
    this.progressText = this.addText(
      500, 545,
      'CALIBRATION: 0 / 3',
      14, '#7dd3fc'
    );

    this.statusText = this.addText(
      500, 568,
      'SCRUBBER SYSTEM STANDBY',
      12, '#facc15'
    );

    // Cancel button
    const cancel = scene.add.rectangle(
      500, 600, 140, 30,
      0x713b42
    )
      .setStrokeStyle(2, 0xfca5a5)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(cancel);

    this.addText(
      500, 600,
      'CANCEL',
      12, '#ffffff'
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

  adjustValue(index, amount) {
    if (this.finished) return;

    const parameter = this.parameters[index];

    parameter.value = PhaserValueClamp(
      parameter.value + amount,
      0,
      100
    );

    this.updateProgress();
  }

  updateProgress() {
    let completed = 0;

    this.parameters.forEach((parameter, index) => {
      const control = this.controls[index];

      if (!control) return;

      control.valueText.setText(
        `${parameter.value}${parameter.unit}`
      );

      const correct =
        parameter.value === parameter.target;

      if (correct) {
        completed++;

        control.valueText.setColor('#4ade80');
        control.targetText.setColor('#4ade80');
      } else {
        control.valueText.setColor('#facc15');
        control.targetText.setColor('#7dd3fc');
      }
    });

    this.progressText.setText(
      `CALIBRATION: ${completed} / 3`
    );

    if (completed === 3) {
      this.completePuzzle();
      return;
    }

    this.statusText.setText(
      'ADJUST PARAMETERS TO MATCH TARGETS'
    );

    this.statusText.setColor('#facc15');
  }

  completePuzzle() {
    if (this.finished) return;

    this.finished = true;

    this.statusText.setText(
      'CO2 SCRUBBER ONLINE! AIR PURIFICATION RESTORED.'
    );

    this.statusText.setColor('#4ade80');

    this.progressText.setText(
      'ALL PARAMETERS CALIBRATED'
    );

    this.controls.forEach(control => {
      control.minus.disableInteractive();
      control.plus.disableInteractive();
    });

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
    this.controls = [];
  }
}

// Keep values within the allowed calibration range.
function PhaserValueClamp(value, minimum, maximum) {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}
