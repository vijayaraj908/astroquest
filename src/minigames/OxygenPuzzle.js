
export default class OxygenPuzzle {
  constructor(scene, onComplete, onCancel) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.onCancel = onCancel;

    this.objects = [];
    this.buttons = [];
    this.finished = false;
    this.currentStep = 0;

    this.steps = [
      {
        name: 'WATER FEED PUMP',
        description: 'Establish water supply',
        color: 0x38bdf8
      },
      {
        name: 'POWER COUPLING',
        description: 'Connect electrical supply',
        color: 0xfacc15
      },
      {
        name: 'ELECTROLYSIS CHAMBER',
        description: 'Separate hydrogen and oxygen',
        color: 0x4ade80
      },
      {
        name: 'OXYGEN RELEASE VALVE',
        description: 'Release purified oxygen',
        color: 0xc084fc
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
        500, 325, 700, 490,
        0x142638
      )
        .setStrokeStyle(3, 0x66e0cc)
        .setDepth(1001)
    );

    this.addText(
      500, 105,
      'OXYGEN GENERATION ASSEMBLY',
      24, '#66e0cc'
    );

    this.addText(
      500, 140,
      'LIFE SUPPORT SYSTEM ACTIVATION',
      14, '#ffffff'
    );

    this.addText(
      500, 175,
      'Activate all components in the correct sequence.',
      13, '#a9bacb'
    );

    this.addText(
      500, 205,
      'Follow the oxygen generation process.',
      12, '#7dd3fc'
    );

    // Component buttons
    const positions = [265, 330, 395, 460];

    this.steps.forEach((step, index) => {
      const y = positions[index];

      const button = scene.add.rectangle(
        500, y, 430, 48,
        0x263d50
      )
        .setStrokeStyle(2, 0x55758c)
        .setDepth(1003)
        .setInteractive({
          useHandCursor: true
        });

      this.add(button);

      const label = this.addText(
        500, y - 7,
        step.name,
        14, '#ffffff'
      );

      const description = this.addText(
        500, y + 13,
        step.description,
        10, '#a9bacb'
      );

      this.buttons.push({
        button,
        label,
        description,
        step
      });

      button.on('pointerdown', () => {
        this.activateComponent(index);
      });
    });

    this.progressText = this.addText(
      500, 520,
      'SYSTEM PROGRESS: 0 / 4',
      14, '#7dd3fc'
    );

    this.statusText = this.addText(
      500, 545,
      'WAITING FOR COMPONENT ACTIVATION',
      12, '#facc15'
    );

    // Cancel button
    const cancel = scene.add.rectangle(
      500, 585, 140, 32,
      0x713b42
    )
      .setStrokeStyle(2, 0xfca5a5)
      .setDepth(1003)
      .setInteractive({
        useHandCursor: true
      });

    this.add(cancel);

    this.addText(
      500, 585,
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
  }

  activateComponent(index) {
    if (this.finished) return;

    // Check the required activation order.
    if (index !== this.currentStep) {
      this.currentStep = 0;

      this.resetButtons();

      this.statusText.setText(
        'INCORRECT SEQUENCE! START AGAIN.'
      );

      this.statusText.setColor('#f87171');

      this.progressText.setText(
        'SYSTEM PROGRESS: 0 / 4'
      );

      return;
    }

    const component = this.buttons[index];

    // Mark component as activated.
    component.button.setFillStyle(0x145b48);

    component.button.setStrokeStyle(
      2, 0x4ade80
    );

    component.label.setColor('#4ade80');

    component.description.setText(
      'ACTIVATED'
    );

    component.description.setColor('#4ade80');

    // Disable the completed component.
    component.button.disableInteractive();

    this.currentStep++;

    this.progressText.setText(
      `SYSTEM PROGRESS: ${this.currentStep} / 4`
    );

    this.statusText.setText(
      `${component.step.name} ACTIVATED`
    );

    this.statusText.setColor('#4ade80');

    // Check completion.
    if (this.currentStep === this.steps.length) {
      this.completePuzzle();
    }
  }

  resetButtons() {
    this.buttons.forEach(item => {
      item.button.setFillStyle(0x263d50);

      item.button.setStrokeStyle(
        2, 0x55758c
      );

      item.label.setColor('#ffffff');

      item.description.setText(
        item.step.description
      );

      item.description.setColor('#a9bacb');

      item.button.setInteractive({
        useHandCursor: true
      });
    });
  }

  completePuzzle() {
    if (this.finished) return;

    this.finished = true;

    this.statusText.setText(
      'OXYGEN GENERATION SYSTEM ONLINE!'
    );

    this.statusText.setColor('#4ade80');

    this.progressText.setText(
      'ALL COMPONENTS ACTIVATED'
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
    this.buttons = [];
  }
}
