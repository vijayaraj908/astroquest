
export default class FacilityPanel {
  constructor(scene) {
    this.scene = scene;
    this.onClose = null;

    this.container = null;
    this.operationButton = null;
    this.operationLabel = null;
    this.statusText = null;

    this.sleepButton = null;
    this.sleepLabel = null;
    this.dailyInfoText = null;
    this.emergencyInfoText = null;
    this.shelterButton = null;
    this.shelterLabel = null;
        // Oxygen generator emergency repair controls.
    this.oxygenRepairButton = null;
    this.oxygenRepairLabel = null;
    this.oxygenRepairStarting = false;
  }

  open(facility, callbacks = {}) {
    const scene = this.scene;
    this.onClose = callbacks.onClose || null;

    if (this.container) return;

    const panel = scene.add.container(500, 325);
    panel.setDepth(1000);
    
    // Keep the facility console fixed to the screen.
    panel.setScrollFactor(0);

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
        align: 'center',
        wordWrap: { width: 680 }
      }
    ).setOrigin(0.5);

    this.operationButton = null;
    this.operationLabel = null;

    if (facility.id === 'LCC') {
      this.createCommandCenterPanel(facility, callbacks, panel);

    } else if (facility.operation) {

      const emergencyStatus = callbacks.getEmergencyStatus
        ? callbacks.getEmergencyStatus()
        : null;

      const oxygenFailure = emergencyStatus
        ? emergencyStatus.oxygenFailure
        : null;

      if (
        facility.id === 'OGA' &&
        oxygenFailure &&
        !oxygenFailure.resolved
      ) {
        this.createOxygenRepairButton(callbacks);

      } else {
        this.createOperationButton(facility, callbacks, panel);
      }
    }

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

    if (facility.id === 'LCC') {
      // Keep these objects inside the panel for cleanup.
      description.setVisible(false);
      resources.setVisible(false);
      task.setVisible(false);

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

    } else {
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
    }

    if (this.operationButton) {
      panel.add([
        this.operationButton,
        this.operationLabel
      ]);
    }
        // Add oxygen emergency repair controls.
    if (
      this.oxygenRepairButton &&
      this.oxygenRepairLabel
    ) {
      panel.add([
        this.oxygenRepairButton,
        this.oxygenRepairLabel
      ]);
    }

    // Add emergency information.
    if (this.emergencyInfoText) {
      panel.add(this.emergencyInfoText);
    }

    // Add shelter controls.
    if (this.shelterButton && this.shelterLabel) {
      panel.add([
        this.shelterButton,
        this.shelterLabel
      ]);
    }

    // Add daily operations information.
    if (this.dailyInfoText) {
      panel.add(this.dailyInfoText);
    }

    // Add sleep controls.
    if (this.sleepButton && this.sleepLabel) {
      panel.add([
        this.sleepButton,
        this.sleepLabel
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

 
createOperationButton(facility, callbacks) {
  const alreadyCompleted = callbacks.isActivated
    ? callbacks.isActivated(facility.id)
    : false;

  const validation = callbacks.canActivate
    ? callbacks.canActivate(facility)
    : { allowed: true, reason: 'Facility ready.' };

  this.operationButton = this.scene.add.rectangle(
    0, 130, 230, 36, 0x16875c
  );

  this.operationButton.setStrokeStyle(
    1, 0x8dffb0
  );

  let label = 'START MINI-GAME';
  let enabled = true;

  if (alreadyCompleted) {
    label = 'COMPLETED TODAY';
    enabled = false;

    this.statusText.setText(
      'DAILY OPERATION COMPLETED'
    );

    this.statusText.setColor('#8dffb0');

  } else if (!validation.allowed) {
    label = 'OPERATION LOCKED';
    enabled = false;

    this.statusText.setText(validation.reason);
    this.statusText.setColor('#ff8585');
  }

  this.operationLabel = this.scene.add.text(
    0, 130,
    label,
    {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  ).setOrigin(0.5);

  if (!enabled) {
    this.operationButton.setFillStyle(0x405363);
    return;
  }

  this.operationButton.setInteractive({
    useHandCursor: true
  });

  // Shared action for mouse click and ENTER key.
  this.startMiniGameAction = () => {
    if (this.miniGameStarting || !this.container) {
      return;
    }

    if (!callbacks.onStartMiniGame) return;

    this.miniGameStarting = true;

    this.operationButton.disableInteractive();
    this.operationButton.setFillStyle(0x405363);

    this.operationLabel.setText('PUZZLE LOADING');

    this.statusText.setText(
      'PREPARING FACILITY CHALLENGE...'
    );

    this.statusText.setColor('#7dd3fc');

    const started = callbacks.onStartMiniGame(
      facility,

      result => {
        this.miniGameStarting = false;

        if (result.success) {
          this.markCompleted(result.message);
        } else {
          this.restoreButton(result.message);
        }
      },

      () => {
        this.miniGameStarting = false;

        this.restoreButton(
          'PUZZLE CANCELLED. PRESS ENTER TO TRY AGAIN.'
        );
      }
    );

    if (!started) {
      this.miniGameStarting = false;

      this.restoreButton(
        'OPERATION UNAVAILABLE. CHECK DAILY RULES AND RESOURCES.'
      );
    }
  };

  // Mouse support.
  this.operationButton.on(
    'pointerdown',
    this.startMiniGameAction
  );

  // ENTER keyboard support.
  this.enterHandler = (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    this.startMiniGameAction();
  };

  this.scene.input.keyboard.on(
    'keydown-ENTER',
    this.enterHandler
  );

  this.statusText.setText(
    'CLICK START MINI-GAME OR PRESS ENTER.'
  );

  this.statusText.setColor('#8dffb0');
}
// ==========================================
// OXYGEN GENERATOR EMERGENCY REPAIR BUTTON
// ==========================================

createOxygenRepairButton(callbacks) {

  this.statusText.setText(
    '!! OXYGEN GENERATOR FAILURE !!\n' +
    'GENERATOR OFFLINE. EMERGENCY REPAIR REQUIRED.'
  );

  this.statusText.setColor('#ff7777');

  this.oxygenRepairButton = this.scene.add.rectangle(
    0,
    130,
    280,
    40,
    0x9c3434
  );

  this.oxygenRepairButton.setStrokeStyle(
    2,
    0xff9999
  );

  this.oxygenRepairLabel = this.scene.add.text(
    0,
    130,
    'INITIATE EMERGENCY REPAIR',
    {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  ).setOrigin(0.5);

  this.oxygenRepairButton.setInteractive({
    useHandCursor: true
  });

  this.oxygenRepairButton.on('pointerdown', () => {

    if (
      this.oxygenRepairStarting ||
      !this.container
    ) {
      return;
    }

    if (!callbacks.onRepairOxygenGenerator) {
      return;
    }

    this.oxygenRepairStarting = true;

    this.oxygenRepairButton.disableInteractive();
    this.oxygenRepairButton.setFillStyle(0x405363);

    this.oxygenRepairLabel.setText(
      'REPAIR PUZZLE LOADING...'
    );

    this.statusText.setText(
      'INITIALIZING EMERGENCY REPAIR SEQUENCE...'
    );

    this.statusText.setColor('#7dd3fc');

    const started = callbacks.onRepairOxygenGenerator(

      result => {

        this.oxygenRepairStarting = false;

        if (result && result.success) {

          this.statusText.setText(result.message);
          this.statusText.setColor('#8dffb0');

          this.oxygenRepairButton.disableInteractive();
          this.oxygenRepairButton.setFillStyle(0x16875c);

          this.oxygenRepairLabel.setText(
            'GENERATOR RESTORED'
          );

        } else {

          this.statusText.setText(
            result
              ? result.message
              : 'OXYGEN GENERATOR REPAIR FAILED.'
          );

          this.statusText.setColor('#ff7777');

          this.oxygenRepairButton.setFillStyle(0x9c3434);

          this.oxygenRepairButton.setInteractive({
            useHandCursor: true
          });

          this.oxygenRepairLabel.setText(
            'RETRY EMERGENCY REPAIR'
          );
        }
      },

      () => {

        this.oxygenRepairStarting = false;

        this.statusText.setText(
          'REPAIR CANCELLED. GENERATOR REMAINS OFFLINE.'
        );

        this.statusText.setColor('#ffcc80');

        this.oxygenRepairButton.setFillStyle(0x9c3434);

        this.oxygenRepairButton.setInteractive({
          useHandCursor: true
        });

        this.oxygenRepairLabel.setText(
          'RETRY EMERGENCY REPAIR'
        );
      }
    );

    if (!started) {

      this.oxygenRepairStarting = false;

      this.statusText.setText(
        'REPAIR UNAVAILABLE. TRY AGAIN.'
      );

      this.statusText.setColor('#ff7777');

      this.oxygenRepairButton.setFillStyle(0x9c3434);

      this.oxygenRepairButton.setInteractive({
        useHandCursor: true
      });

      this.oxygenRepairLabel.setText(
        'RETRY EMERGENCY REPAIR'
      );
    }
  });
}


createCommandCenterPanel(facility, callbacks, panel) {
  const status = callbacks.getDailyStatus
    ? callbacks.getDailyStatus()
    : null;

  const missing = status ? status.missingTasks : [];

  const emergencyStatus = callbacks.getEmergencyStatus
    ? callbacks.getEmergencyStatus()
    : { active: false, emergency: null };

  const emergency = emergencyStatus.emergency;

  // ==========================================
  // DAILY OPERATIONS SUMMARY
  // ==========================================

  const summaryLines = status
    ? [
        `OPERATIONAL DAY: ${status.day}`,
        `DAILY TASKS: ${status.completedCount} / ${status.requiredCount}`,
        `PRODUCTION CHOICE: ${status.productionChoiceName}`,
        '',
        status.canSleep
          ? 'ALL DAILY OPERATIONS COMPLETE.'
          : 'REMAINING DAILY OPERATIONS:',
        ...missing.slice(0, 6).map(item => `• ${item}`)
      ]
    : ['Daily operations status unavailable.'];

  this.dailyInfoText = this.scene.add.text(
    -320,
    -115,
    summaryLines.join('\n'),
    {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#d6e8f5',
      lineSpacing: 5,
      wordWrap: { width: 640 }
    }
  );

  // ==========================================
  // EMERGENCY WARNING
  // ==========================================

  this.emergencyInfoText = this.scene.add.text(
    -320,
    -175,
    emergencyStatus.active
      ? '!! SOLAR RADIATION STORM DETECTED !!\nACTIVATE RADIATION SHELTER\nPOWER REQUIRED: 8 kW'
      : 'NO ACTIVE EMERGENCIES',
    {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: emergencyStatus.active ? '#ff7777' : '#8dffb0',
      fontStyle: 'bold',
      lineSpacing: 5,
      wordWrap: { width: 640 }
    }
  );

  // ==========================================
  // RADIATION SHELTER BUTTON
  // ==========================================

  const shelterActivated =
    emergencyStatus.active && emergency.shelterActivated;

  const shelterAvailable =
    emergencyStatus.active && !shelterActivated;

  this.shelterButton = this.scene.add.rectangle(
    0,
    75,
    280,
    38,
    shelterAvailable ? 0x9c3434 : 0x405363
  );

  this.shelterButton.setStrokeStyle(2, 0xff9999);

  this.shelterLabel = this.scene.add.text(
    0,
    75,
    shelterActivated
      ? 'SHELTER ACTIVATED'
      : shelterAvailable
        ? 'ACTIVATE RADIATION SHELTER'
        : 'NO ACTIVE EMERGENCY',
    {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  ).setOrigin(0.5);

  if (shelterAvailable) {
    this.shelterButton.setInteractive({
      useHandCursor: true
    });

    this.shelterButton.on('pointerdown', () => {
      if (!callbacks.onActivateShelter) return;

      const result = callbacks.onActivateShelter();

      this.emergencyInfoText.setText(result.message);

      if (result.success) {
        this.emergencyInfoText.setColor('#8dffb0');

        this.shelterButton.disableInteractive();
        this.shelterButton.setFillStyle(0x16875c);
        this.shelterLabel.setText('SHELTER ACTIVATED');
      } else {
        this.emergencyInfoText.setColor('#ff7777');
      }
    });
  }

  // ==========================================
  // SLEEP BUTTON
  // ==========================================

  this.sleepButton = this.scene.add.rectangle(
    0,
    130,
    280,
    38,
    status && status.canSleep ? 0x16875c : 0x405363
  );

  this.sleepButton.setStrokeStyle(
    2,
    status && status.canSleep ? 0x8dffb0 : 0x708090
  );

  this.sleepLabel = this.scene.add.text(
    0,
    130,
    status && status.canSleep
      ? 'SLEEP & START NEXT DAY'
      : 'SLEEP LOCKED - TASKS REMAIN',
    {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  ).setOrigin(0.5);

  if (!status || !status.canSleep) {
    this.statusText.setText(
      'COMPLETE ALL SIX DAILY OPERATIONS BEFORE SLEEPING.'
    );

    this.statusText.setColor('#ffcc80');
  } else {
    this.statusText.setText(
      'ALL REQUIREMENTS MET. RETURN TO YOUR QUARTERS TO REST.'
    );

    this.statusText.setColor('#8dffb0');

    this.sleepButton.setInteractive({
      useHandCursor: true
    });

    this.sleepButton.on('pointerdown', () => {
      if (!callbacks.onSleep) return;

      this.sleepButton.disableInteractive();
      this.sleepButton.setFillStyle(0x405363);
      this.sleepLabel.setText('ADVANCING DAY...');

      const result = callbacks.onSleep();

      if (!result || !result.success) {
        this.sleepLabel.setText('SLEEP UNAVAILABLE');

        this.statusText.setText(
          result ? result.message : 'Unable to advance day.'
        );

        this.statusText.setColor('#ff8585');

        this.sleepButton.setFillStyle(0x405363);
        return;
      }

      // ==========================================
      // UPDATE INVENTORY AND SURVIVAL REPORT
      // ==========================================

      const inventory = result.resources || {};
      const survival = result.survival || {};
      const emergencyReport = result.emergencyReport;

      this.dailyInfoText.setText([
        `DAY ${result.completedDay} COMPLETE`,
        `NEW OPERATIONAL DAY: ${result.newDay}`,
        `PRODUCTION: ${result.productionChoice === 'WRS' ? 'WATER' : 'OXYGEN'}`,
        '',
        'END-OF-DAY INVENTORY',
        `POWER: ${inventory.electricity ?? 0} kW`,
        `WATER: ${inventory.water ?? 0} L`,
        `OXYGEN: ${inventory.oxygen ?? 0}`,
        `FUEL CELLS: ${inventory.fuelCells ?? 0}`,
        `FOOD: ${inventory.food ?? 0}`,
        '',
        'CREW SURVIVAL REPORT',
        `HEALTH: ${survival.health ?? 100}%`,
        `CONDITION: ${survival.condition ?? 'STABLE'}`,
        `FOOD CONSUMED: ${survival.foodConsumed ?? 0}`,
        '',
        emergencyReport
          ? `EMERGENCY: ${emergencyReport.message}`
          : 'EMERGENCY: NO INCIDENT REPORTED',
        '',
        'DAILY TASKS RESET. INVENTORY CARRIED FORWARD.'
      ].join('\n'));

      // ==========================================
      // REFRESH EMERGENCY STATUS FOR NEW DAY
      // ==========================================

      const nextEmergencyStatus = callbacks.getEmergencyStatus
        ? callbacks.getEmergencyStatus()
        : { active: false, emergency: null };

      if (nextEmergencyStatus.active) {
        this.emergencyInfoText.setText(
          '!! SOLAR RADIATION STORM DETECTED !!\nACTIVATE RADIATION SHELTER\nPOWER REQUIRED: 8 kW'
        );

        this.emergencyInfoText.setColor('#ff7777');

        this.shelterButton.setFillStyle(0x9c3434);
        this.shelterLabel.setText('ACTIVATE RADIATION SHELTER');

        this.shelterButton.setInteractive({
          useHandCursor: true
        });

        // Remove the previous click handler before adding the new one.
        this.shelterButton.removeAllListeners('pointerdown');

        this.shelterButton.on('pointerdown', () => {
          if (!callbacks.onActivateShelter) return;

          const shelterResult = callbacks.onActivateShelter();

          this.emergencyInfoText.setText(shelterResult.message);

          if (shelterResult.success) {
            this.emergencyInfoText.setColor('#8dffb0');
            this.shelterButton.disableInteractive();
            this.shelterButton.setFillStyle(0x16875c);
            this.shelterLabel.setText('SHELTER ACTIVATED');
          } else {
            this.emergencyInfoText.setColor('#ff7777');
          }
        });
      } else {
        this.emergencyInfoText.setText('NO ACTIVE EMERGENCIES');
        this.emergencyInfoText.setColor('#8dffb0');

        this.shelterButton.disableInteractive();
        this.shelterButton.setFillStyle(0x405363);
        this.shelterLabel.setText('NO ACTIVE EMERGENCY');
      }

      // ==========================================
      // UPDATE DAY STATUS
      // ==========================================

      this.statusText.setText(
        `DAY ${result.newDay} HAS BEGUN. SELECT YOUR NEXT PRODUCTION PRIORITY.`
      );

      this.statusText.setColor('#7dd3fc');

      this.sleepLabel.setText(
        `DAY ${result.newDay} IN PROGRESS`
      );
    });
  }

  
}

  markCompleted(message = 'DAILY OPERATION COMPLETED.') {
    if (!this.container) return;

    this.statusText.setText(message);
    this.statusText.setColor('#8dffb0');

    if (this.operationButton) {
      this.operationButton.disableInteractive();
      this.operationButton.setFillStyle(0x405363);
    }

    if (this.operationLabel) {
      this.operationLabel.setText('COMPLETED TODAY');
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
  // Remove ENTER keyboard listener first.
  if (this.enterHandler) {
    this.scene.input.keyboard.off(
      'keydown-ENTER',
      this.enterHandler
    );
  }

  this.enterHandler = null;
  this.startMiniGameAction = null;
  this.miniGameStarting = false;

  // Destroy the main panel container and its children.
  if (this.container) {
    this.container.destroy();
    this.container = null;
  }

  // Clear operation controls.
  this.operationButton = null;
  this.operationLabel = null;

    // Clear oxygen emergency repair controls.
  this.oxygenRepairButton = null;
  this.oxygenRepairLabel = null;
  this.oxygenRepairStarting = false;

  // Clear daily operations controls.
  this.sleepButton = null;
  this.sleepLabel = null;
  this.dailyInfoText = null;
  this.statusText = null;

  // Clear emergency controls.
  this.emergencyInfoText = null;
  this.shelterButton = null;
  this.shelterLabel = null;

  // Preserve callback before clearing it.
  const callback = this.onClose;
  this.onClose = null;

  if (callback) {
    callback();
  }
}


  get isOpen() {
    return Boolean(this.container);
  }
}
