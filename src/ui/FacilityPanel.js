
export default class FacilityPanel {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.operationButton = null;
    this.operationLabel = null;
    this.statusText = null;
  }

  open(facility, callbacks = {}) {
    const scene = this.scene;

    if (this.container) return;

    const panel = scene.add.container(500, 325);
    panel.setDepth(1000);

    const overlay = scene.add.rectangle(
      0, 0, 1000, 650, 0x030a12, 0.88
    );

    const background = scene.add.rectangle(
      0, 0, 760, 450, 0x102235
    );

    background.setStrokeStyle(3, facility.color);

    const header = scene.add.rectangle(
      0, -190, 760, 70, 0x1c354b
    );

    const title = scene.add.text(
      0, -190, facility.name,
      {
        fontSize: '21px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 700 }
      }
    ).setOrigin(0.5);

    const description = scene.add.text(
      -335, -125,
      `FACILITY PURPOSE\n\n${facility.purpose}`,
      {
        fontSize: '16px',
        color: '#d6e8f5',
        lineSpacing: 7,
        wordWrap: { width: 670 }
      }
    );

    const resources = scene.add.text(
      -335, -20,
      `RESOURCE PROFILE\n\n${facility.resources}`,
      {
        fontSize: '16px',
        color: '#7fe7ff',
        lineSpacing: 7,
        wordWrap: { width: 670 }
      }
    );

    const task = scene.add.text(
      -335, 65,
      `PLANNED OPERATION\n\n${facility.task}`,
      {
        fontSize: '14px',
        color: '#d5e8d9',
        lineSpacing: 5,
        wordWrap: { width: 670 }
      }
    );

    this.statusText = scene.add.text(
      0, 175,
      'FACILITY READY',
      {
        fontSize: '12px',
        color: '#ffcc80',
        align: 'center'
      }
    ).setOrigin(0.5);

    // ==================================
    // MINI-GAME / ACTIVATION BUTTON
    // ==================================

    this.operationButton = null;
    this.operationLabel = null;

    if (facility.operation) {
      const alreadyActivated = callbacks.isActivated
        ? callbacks.isActivated(facility.id)
        : false;

      this.operationButton = scene.add.rectangle(
        0, 130, 230, 36, 0x16875c
      );

      this.operationButton.setStrokeStyle(
        1, 0x8dffb0
      );

      this.operationLabel = scene.add.text(
        0, 130,
        alreadyActivated
          ? 'OPERATION COMPLETED'
          : 'START MINI-GAME',
        {
          fontSize: '13px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      if (alreadyActivated) {
        this.operationButton.setFillStyle(0x405363);
        this.statusText.setText('OPERATION ALREADY COMPLETED');
        this.statusText.setColor('#8dffb0');

      } else {
        const validation = callbacks.canActivate
          ? callbacks.canActivate(facility)
          : { allowed: true };

        if (!validation.allowed) {
          this.operationButton.setFillStyle(0x405363);
          this.operationLabel.setText('INSUFFICIENT RESOURCES');
          this.statusText.setText(validation.reason);
          this.statusText.setColor('#ff8585');

        } else {
          this.operationButton.setInteractive({
            useHandCursor: true
          });

          this.operationButton.on('pointerdown', () => {
            if (!callbacks.onStartMiniGame) return;

            this.operationButton.disableInteractive();
            this.operationButton.setFillStyle(0x405363);
            this.operationLabel.setText('PUZZLE LOADING');

            this.statusText.setText('PREPARING FACILITY CHALLENGE...');
            this.statusText.setColor('#7dd3fc');

            const started = callbacks.onStartMiniGame(
              facility,
              (result) => {
                if (result.success) {
                  this.markCompleted(result.message);
                } else {
                  this.restoreButton(result.message);
                }
              },
              () => {
                this.restoreButton('PUZZLE CANCELLED. TRY AGAIN.');
              }
            );

            if (!started) {
              this.restoreButton(
                'NO MINI-GAME AVAILABLE FOR THIS FACILITY YET.'
              );
            }
          });
        }
      }
    }

    // ==================================
    // CLOSE BUTTON
    // ==================================

    const closeButton = scene.add.rectangle(
      0, 215, 200, 35, 0x1687d9
    );

    closeButton.setStrokeStyle(1, 0x80d5ff);

    closeButton.setInteractive({
      useHandCursor: true
    });

    const closeText = scene.add.text(
      0, 215,
      'CLOSE CONSOLE',
      {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // Add elements to panel.
    panel.add([
      overlay,
      background,
      header,
      title,
      description,
      resources,
      task,
      this.statusText
    ]);

    if (this.operationButton) {
      panel.add([
        this.operationButton,
        this.operationLabel
      ]);
    }

    panel.add([
      closeButton,
      closeText
    ]);

    closeButton.on('pointerdown', () => {
      this.close();
    });

    this.container = panel;
  }

  markCompleted(message = 'FACILITY ACTIVATED SUCCESSFULLY.') {
    if (!this.container) return;

    this.statusText.setText(message);
    this.statusText.setColor('#8dffb0');

    if (this.operationButton) {
      this.operationButton.disableInteractive();
      this.operationButton.setFillStyle(0x405363);
    }

    if (this.operationLabel) {
      this.operationLabel.setText('OPERATION COMPLETED');
    }
  }

  restoreButton(message) {
    if (!this.container) return;

    this.statusText.setText(message);
    this.statusText.setColor('#ffcc80');

    if (this.operationButton) {
      this.operationButton.setFillStyle(0x16875c);

      this.operationButton.setInteractive({
        useHandCursor: true
      });
    }

    if (this.operationLabel) {
      this.operationLabel.setText('START MINI-GAME');
    }
  }

  close() {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }

    this.operationButton = null;
    this.operationLabel = null;
    this.statusText = null;
  }

  get isOpen() {
    return Boolean(this.container);
  }
}
