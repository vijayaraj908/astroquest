export default class ExplorationHUD {

  constructor(scene) {
    this.scene = scene;
  }

  create() {

    const scene = this.scene;

    scene.add.rectangle(
      500, 30, 1000, 60, 0x080e1c, 0.96
    );

    scene.add.text(
      20, 18,
      'ASTROQUEST | LUNAR EXPEDITION 01',
      {
        fontSize: '17px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );

    scene.add.text(
      690, 18,
      'GRAVITY: 1.62 m/s²',
      {
        fontSize: '15px',
        color: '#80ceff'
      }
    );

    this.statusText = scene.add.text(
      20, 590,
      'STATUS: EXPLORING SUNLIT TERRAIN',
      {
        fontSize: '14px',
        color: '#a8e3b3',
        backgroundColor: '#101923',
        padding: { x: 10, y: 8 }
      }
    );

    scene.add.text(
      20, 625,
      'WASD / ARROWS: MOVE  |  E: INSPECT  |  ESC: CLOSE',
      {
        fontSize: '12px',
        color: '#c1cbd5'
      }
    );

    scene.add.text(
      700, 625,
      'LUNAR SOUTH POLE',
      {
        fontSize: '12px',
        color: '#c1cbd5'
      }
    );

    this.objectiveText = scene.add.text(
      20, 78,
      'OBJECTIVE: Inspect all eight lunar facilities',
      {
        fontSize: '13px',
        color: '#ffffff',
        backgroundColor: '#263746',
        padding: { x: 8, y: 6 }
      }
    );

    scene.add.text(
      20, 110,
      'Explore the base and inspect each operational module.',
      {
        fontSize: '12px',
        color: '#d1dbe4'
      }
    );

    this.facilityCounterText = scene.add.text(
      770, 43,
      'FACILITIES: 0 / 8',
      {
        fontSize: '14px',
        color: '#7fe7ff',
        fontStyle: 'bold'
      }
    ).setOrigin(1, 0);

    this.interactionPrompt = scene.add.text(
      500, 555,
      '',
      {
        fontSize: '15px',
        color: '#ffffff',
        backgroundColor: '#102d43',
        padding: { x: 12, y: 8 },
        align: 'center'
      }
    ).setOrigin(0.5).setVisible(false);
  }

  setStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor(color);
  }

  setFacilityCount(count, total) {
    this.facilityCounterText.setText(
      `FACILITIES: ${count} / ${total}`
    );
  }

  completeObjective() {
    this.objectiveText.setText(
      'OBJECTIVE COMPLETE: ALL 8 FACILITIES INSPECTED'
    );

    this.objectiveText.setColor('#8dffb0');
  }
}