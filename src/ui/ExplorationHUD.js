
export default class ExplorationHUD {
  constructor(scene) {
    this.scene = scene;
    this.uiObjects = [];
  }

  create() {
    const scene = this.scene;

    // ==================================
    // FIXED SIDEBAR
    // ==================================

    const sidebar = scene.add.rectangle(
      135, 325, 270, 650,
      0x091523, 0.98
    );

    sidebar.setScrollFactor(0);
    sidebar.setDepth(100);

    this.uiObjects.push(sidebar);

    const addText = (
      x, y, value, size, color, bold = false
    ) => {
      const text = scene.add.text(
        x, y, value,
        {
          fontFamily: 'monospace',
          fontSize: `${size}px`,
          color,
          fontStyle: bold ? 'bold' : 'normal',
          wordWrap: { width: 235 },
          lineSpacing: 5
        }
      );

      text.setScrollFactor(0);
      text.setDepth(102);

      this.uiObjects.push(text);

      return text;
    };

    const addDivider = (y) => {
      const line = scene.add.rectangle(
        135, y, 230, 1,
        0x36516a
      );

      line.setScrollFactor(0);
      line.setDepth(102);

      this.uiObjects.push(line);
    };

    // Header
    addText(
      16, 15,
      'ASTROQUEST',
      21, '#ffffff', true
    );

    addText(
      16, 43,
      'LUNAR EXPEDITION 01',
      10, '#7dd3fc', true
    );

    addDivider(72);

    // Mission day
    addText(
      16, 88,
      'OPERATIONAL DAY',
      11, '#91a9bf', true
    );

    this.dayText = addText(
      16, 108,
      'DAY 01',
      25, '#7dd3fc', true
    );

    this.dailyStatusText = addText(
      16, 143,
      'DAILY TASKS: 0 / 6',
      13, '#8dffb0', true
    );

    addDivider(175);

    // Resources section
    addText(
      16, 188,
      'BASE RESOURCE INVENTORY',
      11, '#91a9bf', true
    );

    addDivider(280);

    // Production choice
    addText(
      16, 294,
      'PRODUCTION PRIORITY',
      11, '#91a9bf', true
    );

    this.dailyChoiceText = addText(
      16, 316,
      'NOT SELECTED',
      14, '#facc15', true
    );

    this.productionHintText = addText(
      16, 341,
      'Choose Water Recovery or Oxygen Generation.',
      10, '#b6c9da'
    );

    addDivider(395);

    // Daily objectives
    addText(
      16, 409,
      'DAILY OBJECTIVES',
      12, '#91a9bf', true
    );

    this.objectiveText = addText(
      16, 435,
      '○ SOLAR - Power\n○ WRS / OGA - Production\n○ BLSM - Life Support\n○ LAB - Synthesis\n○ CREW - Medical\n○ EVA - Suit Preparation',
      10, '#d3e1ed'
    );

    addDivider(535);

    // Current status
    addText(
      16, 549,
      'MISSION STATUS',
      10, '#91a9bf', true
    );

    this.statusText = addText(
      16, 570,
      'EXPLORING LUNAR TERRAIN',
      10, '#a8e3b3', true
    );

    addText(
      16, 615,
      'WASD / ARROWS: MOVE\nE: INSPECT  |  ESC: CLOSE',
      9, '#8fa6ba'
    );

    // ==================================
    // GAMEPLAY AREA INDICATORS
    // ==================================

    this.facilityCounterText = addText(
      975, 14,
      'FACILITIES: 0 / 8',
      12, '#7fe7ff', true
    );

    this.facilityCounterText.setOrigin(1, 0);

    this.interactionPrompt = addText(
      635, 590,
      '',
      14, '#ffffff', true
    );

    this.interactionPrompt
      .setOrigin(0.5)
      .setBackgroundColor('#102d43')
      .setPadding(12, 8)
      .setVisible(false);

    // Fixed separator.
    addDivider(0);
  }

  setStatus(message, color) {
    if (!this.statusText) return;

    this.statusText.setText(message);
    this.statusText.setColor(color);
  }

  setFacilityCount(count, total) {
    this.facilityCounterText.setText(
      `FACILITIES: ${count} / ${total}`
    );
  }

  updateDailyStatus(status) {
    if (!this.dailyStatusText) return;

    this.dayText.setText(
      `DAY ${String(status.day).padStart(2, '0')}`
    );

    this.dailyStatusText.setText(
      `DAILY TASKS: ${status.completedCount} / ${status.requiredCount}`
    );

    this.dailyStatusText.setColor(
      status.canSleep ? '#8dffb0' : '#7dd3fc'
    );

    this.dailyChoiceText.setText(
      status.productionChoiceName
    );

    this.dailyChoiceText.setColor(
      status.productionChoice
        ? '#8dffb0'
        : '#facc15'
    );

    const completed = status.completedTasks || [];

    const productionComplete = Boolean(
      status.productionChoice
    );

    const objectiveLines = [
      `${completed.includes('SOLAR') ? '✓' : '○'} SOLAR - Power`,
      `${productionComplete ? '✓' : '○'} WRS / OGA - Production`,
      `${completed.includes('BLSM') ? '✓' : '○'} BLSM - Life Support`,
      `${completed.includes('LAB') ? '✓' : '○'} LAB - Synthesis`,
      `${completed.includes('CREW') ? '✓' : '○'} CREW - Medical`,
      `${completed.includes('EVA') ? '✓' : '○'} EVA - Suit Preparation`
    ];

    this.objectiveText.setText(
      objectiveLines.join('\n')
    );

    this.objectiveText.setColor(
      status.canSleep ? '#8dffb0' : '#d3e1ed'
    );

    this.productionHintText.setText(
      status.productionChoice
        ? `${status.productionChoiceName} selected. Other production facility locked until tomorrow.`
        : 'Choose Water Recovery or Oxygen Generation.'
    );
  }

  setVisible(visible) {
    this.uiObjects.forEach(object => {
      if (object && object.active) {
        object.setVisible(visible);
      }
    });
  }

  completeObjective() {
    if (this.objectiveText) {
      this.objectiveText.setText(
        'ALL FACILITIES INSPECTED'
      );

      this.objectiveText.setColor('#8dffb0');
    }
  }
}
