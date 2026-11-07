
export default class CREWPuzzle {
  constructor(scene, onComplete, onCancel) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onCancel = onCancel;

    this.objects = [];
    this.finished = false;

    this.systems = [
      {
        name: 'ELECTRICAL SUPPLY',
        description: 'Restore medical equipment power',
        active: false
      },
      {
        name: 'WATER SUPPLY',
        description: 'Open the medical water valve',
        active: false
      },
      {
        name: 'OXYGEN DELIVERY',
        description: 'Restore patient oxygen supply',
        active: false
      }
    ];

    this.medicalAlertCleared = false;

    this.statusText = null;
    this.progressText = null;
    this.alertText = null;
    this.systemButtons = [];
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
        500, 325, 700, 590,
        0x172638
      )
        .setStrokeStyle(3, 0xff9b86)
        .setDepth(1001)
    );

    this.addText(
      500, 110,
      'CREW MEDICAL LIFE SUPPORT',
      23, '#ff9b86'
    );

    this.addText(
      500, 145,
      'EMERGENCY SUPPLY RESTORATION',
      14, '#ffffff'
    );

    this.addText(
      500, 180,
      'Restore the essential supplies to the medical refuge.',
      12, '#a9bacb'
    );

    this.addText(
      500, 225,
      'STEP 1 - LIFE SUPPORT SUPPLY ROUTING',
      13, '#ffffff'
    );

    // Supply controls
    const positions = [295, 365, 435];

    this.systems.forEach((system, index) => {
      const y = positions[index];

      const button = scene.add.rectangle(
        500, y, 450, 48,
        0x713b42
      )
        .setStrokeStyle(2, 0xfca5a5)
        .setDepth(1003)
        .setInteractive({
          useHandCursor: true
        });

      this.add(button);

      const label = this.addText(
        500, y - 7,
        `${system.name}: OFF`,
        13, '#ffffff'
      );

      const description = this.addText(
        500, y + 14,
        system.description,
        10, '#cbd5e1'
      );

      this.systemButtons.push({
        button,
        label,
        description
      });

      button.on('pointerdown', () => {
        this.toggleSystem(index);
      });
    });

    // Medical alert section
    this.addText(
      500, 495,
      'STEP 2 - MEDICAL ALERT CONTROL',
      13, '#ffffff'
    );

    this.alertText = this.addText(
      500, 520,
      'WARNING: MEDICAL REFUGE ALERT ACTIVE',
      11, '#f87171'
    );

    const alertButton = scene.add.rectangle(
      500, 555, 250, 38,
      0x9f3d42
    )
      .setStrokeStyle(2, 0xfca5a5)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(alertButton);

    this.alertLabel = this.addText(
      500, 555,
      'ACKNOWLEDGE MEDICAL ALERT',
      11, '#ffffff'
    );

    alertButton.on('pointerdown', () => {
      this.clearMedicalAlert();
    });

    this.alertButton = alertButton;

    this.progressText = this.addText(
      500, 590,
      'SYSTEMS RESTORED: 0 / 4',
      13, '#7dd3fc'
    );

    this.statusText = this.addText(
      500, 615,
      'MEDICAL REFUGE STANDBY',
      11, '#facc15'
    );

    // Cancel button
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

  toggleSystem(index) {
    if (this.finished) return;

    const system = this.systems[index];
    const control = this.systemButtons[index];

    system.active = !system.active;

    if (system.active) {
      control.button.setFillStyle(0x145b48);

      control.button.setStrokeStyle(
        2, 0x4ade80
      );

      control.label.setText(
        `${system.name}: ONLINE`
      );

      control.label.setColor('#4ade80');

      control.description.setText(
        'SUPPLY RESTORED'
      );

      control.description.setColor('#4ade80');

    } else {
      control.button.setFillStyle(0x713b42);

      control.button.setStrokeStyle(
        2, 0xfca5a5
      );

      control.label.setText(
        `${system.name}: OFF`
      );

      control.label.setColor('#ffffff');

      control.description.setText(
        system.description
      );

      control.description.setColor('#cbd5e1');
    }

    this.updateProgress();
  }

  clearMedicalAlert() {
    if (this.finished || this.medicalAlertCleared) {
      return;
    }

    const allSuppliesOnline = this.systems.every(
      system => system.active
    );

    if (!allSuppliesOnline) {
      this.statusText.setText(
        'RESTORE ALL THREE SUPPLIES FIRST!'
      );

      this.statusText.setColor('#f87171');

      return;
    }

    this.medicalAlertCleared = true;

    this.alertText.setText(
      'MEDICAL ALERT: CLEARED'
    );

    this.alertText.setColor('#4ade80');

    this.alertButton.setFillStyle(0x145b48);

    this.alertButton.setStrokeStyle(
      2, 0x4ade80
    );

    this.alertLabel.setText(
      'MEDICAL ALERT CLEARED'
    );

    this.alertLabel.setColor('#4ade80');

    this.alertButton.disableInteractive();

    this.updateProgress();
  }

  updateProgress() {
    const activeSystems = this.systems.filter(
      system => system.active
    ).length;

    const completed =
      activeSystems +
      (this.medicalAlertCleared ? 1 : 0);

    this.progressText.setText(
      `SYSTEMS RESTORED: ${completed} / 4`
    );

    if (completed === 4) {
      this.completePuzzle();
      return;
    }

    if (activeSystems === 3) {
      this.statusText.setText(
        'ALL SUPPLIES ONLINE - CLEAR MEDICAL ALERT'
      );

      this.statusText.setColor('#4ade80');
    } else {
      this.statusText.setText(
        'RESTORE ALL LIFE SUPPORT SUPPLIES'
      );

      this.statusText.setColor('#facc15');
    }
  }

  completePuzzle() {
    if (this.finished) return;

    this.finished = true;

    this.statusText.setText(
      'MEDICAL REFUGE FULLY OPERATIONAL!'
    );

    this.statusText.setColor('#4ade80');

    this.progressText.setText(
      'ALL MEDICAL SYSTEMS RESTORED'
    );

    this.systemButtons.forEach(control => {
      control.button.disableInteractive();
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
    this.systemButtons = [];
  }
}
