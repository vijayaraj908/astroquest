
export default class EVAPuzzle {
  constructor(scene, onComplete, onCancel) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onCancel = onCancel;

    this.objects = [];
    this.finished = false;

    this.currentStep = 0;
    this.coolantTemperature = 30;
    this.targetTemperature = 60;

    this.steps = [
      'SUIT INTEGRITY INSPECTION',
      'OXYGEN TANK INSTALLATION',
      'BATTERY CONNECTION',
      'COOLANT CALIBRATION',
      'FINAL PRESSURE TEST'
    ];

    this.stepButtons = [];
    this.coolantText = null;
    this.progressText = null;
    this.statusText = null;
    this.pressureButton = null;
  }

  start() {
    const scene = this.scene;

    // Background overlay
    this.add(
      scene.add.rectangle(
        500, 325, 1000, 650,
        0x050a12, 0.93
      )
        .setDepth(1000)
        .setInteractive()
    );

    // Main panel
    this.add(
      scene.add.rectangle(
        500, 325, 740, 610,
        0x172638
      )
        .setStrokeStyle(3, 0xffc078)
        .setDepth(1001)
    );

    this.addText(
      500, 85,
      'EVA SUIT PREPARATION STATION',
      23, '#ffc078'
    );

    this.addText(
      500, 120,
      'EXTRAVEHICULAR ACTIVITY SAFETY PROTOCOL',
      13, '#ffffff'
    );

    this.addText(
      500, 155,
      'Complete all preparation procedures before deployment.',
      12, '#a9bacb'
    );

    // Preparation steps
    const positions = [225, 290, 355];

    for (let i = 0; i < 3; i++) {
      this.createStepButton(
        i,
        500,
        positions[i]
      );
    }

    // Coolant calibration section
    this.addText(
      500, 410,
      'STEP 4 - COOLANT SYSTEM CALIBRATION',
      13, '#ffffff'
    );

    this.addText(
      350, 450,
      'TEMPERATURE',
      11, '#7dd3fc'
    );

    // Minus control
    const minus = scene.add.rectangle(
      430, 475, 48, 34,
      0x713b42
    )
      .setStrokeStyle(1, 0xfca5a5)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(minus);

    this.addText(
      430, 475,
      '-',
      21, '#ffffff'
    );

    minus.on('pointerdown', () => {
      this.adjustCoolant(-5);
    });

    // Temperature display
    this.coolantText = this.addText(
      500, 475,
      '30°C',
      19, '#facc15'
    );

    // Plus control
    const plus = scene.add.rectangle(
      570, 475, 48, 34,
      0x176b55
    )
      .setStrokeStyle(1, 0x4ade80)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(plus);

    this.addText(
      570, 475,
      '+',
      21, '#ffffff'
    );

    plus.on('pointerdown', () => {
      this.adjustCoolant(5);
    });

    this.addText(
      500, 505,
      'REQUIRED TEMPERATURE: 60°C',
      10, '#7dd3fc'
    );

    // Final pressure test
    this.addText(
      500, 535,
      'STEP 5 - FINAL PRESSURE TEST',
      12, '#ffffff'
    );

    this.pressureButton = scene.add.rectangle(
      500, 565, 250, 34,
      0x405363
    )
      .setStrokeStyle(2, 0x8b9baa)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(this.pressureButton);

    this.pressureLabel = this.addText(
      500, 565,
      'INITIATE PRESSURE TEST',
      11, '#ffffff'
    );

    this.pressureButton.on('pointerdown', () => {
      this.completePressureTest();
    });

    // Progress and status
    this.progressText = this.addText(
      500, 600,
      'PREPARATION PROGRESS: 0 / 5',
      12, '#7dd3fc'
    );

    this.statusText = this.addText(
      500, 625,
      'EVA STATION STANDBY',
      10, '#facc15'
    );

    // Cancel button
    const cancel = scene.add.rectangle(
      820, 85, 100, 30,
      0x713b42
    )
      .setStrokeStyle(1, 0xfca5a5)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(cancel);

    this.addText(
      820, 85,
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

  createStepButton(index, x, y) {
    const button = this.scene.add.rectangle(
      x, y, 460, 44,
      0x34495a
    )
      .setStrokeStyle(2, 0x607d91)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(button);

    const label = this.addText(
      x, y,
      `STEP ${index + 1}: ${this.steps[index]}`,
      12, '#ffffff'
    );

    this.stepButtons.push({
      button,
      label
    });

    button.on('pointerdown', () => {
      this.completeStep(index);
    });
  }

  completeStep(index) {
    if (this.finished) return;

    if (index !== this.currentStep) {
      this.statusText.setText(
        'COMPLETE THE PREVIOUS STEP FIRST!'
      );

      this.statusText.setColor('#f87171');

      return;
    }

    // Step 4 is handled by coolant calibration.
    if (index === 3) return;

    // Final pressure test has its own handler.
    if (index === 4) return;

    const control = this.stepButtons[index];

    control.button.setFillStyle(0x145b48);

    control.button.setStrokeStyle(
      2, 0x4ade80
    );

    control.label.setColor('#4ade80');

    control.label.setText(
      `COMPLETED: ${this.steps[index]}`
    );

    control.button.disableInteractive();

    this.currentStep++;

    this.updateProgress();
  }

  adjustCoolant(amount) {
    if (this.finished) return;

    if (this.currentStep !== 3) {
      this.statusText.setText(
        'COMPLETE THE FIRST THREE STEPS FIRST!'
      );

      this.statusText.setColor('#f87171');

      return;
    }

    this.coolantTemperature = Math.max(
      0,
      Math.min(
        100,
        this.coolantTemperature + amount
      )
    );

    this.coolantText.setText(
      `${this.coolantTemperature}°C`
    );

    if (
      this.coolantTemperature ===
      this.targetTemperature
    ) {
      this.coolantText.setColor('#4ade80');

      this.completeCoolantCalibration();

    } else {
      this.coolantText.setColor('#facc15');

      this.statusText.setText(
        'ADJUST COOLANT TO 60°C'
      );

      this.statusText.setColor('#facc15');
    }
  }

  completeCoolantCalibration() {
    if (this.currentStep !== 3) return;

    this.currentStep++;

    this.coolantText.setColor('#4ade80');

    this.statusText.setText(
      'COOLANT SYSTEM CALIBRATED'
    );

    this.statusText.setColor('#4ade80');

    this.updateProgress();
  }

  completePressureTest() {
    if (this.finished) return;

    if (this.currentStep !== 4) {
      this.statusText.setText(
        'COMPLETE ALL PREPARATION STEPS FIRST!'
      );

      this.statusText.setColor('#f87171');

      return;
    }

    this.finished = true;

    this.pressureButton.disableInteractive();

    this.pressureButton.setFillStyle(0x145b48);

    this.pressureLabel.setText(
      'PRESSURE TEST PASSED'
    );

    this.pressureLabel.setColor('#4ade80');

    this.currentStep++;

    this.progressText.setText(
      'PREPARATION PROGRESS: 5 / 5'
    );

    this.statusText.setText(
      'EVA SUIT READY FOR LUNAR DEPLOYMENT!'
    );

    this.statusText.setColor('#4ade80');

    this.scene.time.delayedCall(1400, () => {
      this.destroy();

      if (this.onComplete) {
        this.onComplete();
      }
    });
  }

  updateProgress() {
    this.progressText.setText(
      `PREPARATION PROGRESS: ${this.currentStep} / 5`
    );

    if (this.currentStep < 3) {
      this.statusText.setText(
        'COMPLETE SUIT PREPARATION PROCEDURES'
      );

      this.statusText.setColor('#facc15');

    } else if (this.currentStep === 3) {
      this.statusText.setText(
        'CALIBRATE COOLANT TO 60°C'
      );

      this.statusText.setColor('#facc15');

    } else if (this.currentStep === 4) {
      this.statusText.setText(
        'ALL SYSTEMS READY - RUN PRESSURE TEST'
      );

      this.statusText.setColor('#4ade80');
    }
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
    this.stepButtons = [];
  }
}
