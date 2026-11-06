export default class ResourceHUD {

  constructor(scene, resourceManager) {
    this.scene = scene;
    this.resourceManager = resourceManager;
    this.values = {};
    this.background = null;
  }

  create() {

    // Dashboard background.
    this.background = this.scene.add.rectangle(
      785, 112, 410, 54, 0x101f30, 0.96
    );

    this.background.setStrokeStyle(1, 0x42627b);
    this.background.setDepth(20);

    // Dashboard heading.
    this.scene.add.text(
      590, 88,
      'BASE RESOURCE INVENTORY',
      {
        fontSize: '11px',
        color: '#80ceff',
        fontStyle: 'bold'
      }
    ).setDepth(21);

    const resources = this.resourceManager.getResources();

    this.values.power = this.scene.add.text(
      590, 105, '',
      {
        fontSize: '12px',
        color: '#f6d477',
        fontStyle: 'bold'
      }
    ).setDepth(21);

    this.values.water = this.scene.add.text(
      795, 105, '',
      {
        fontSize: '12px',
        color: '#64c9ff',
        fontStyle: 'bold'
      }
    ).setDepth(21);

    this.values.oxygen = this.scene.add.text(
      590, 128, '',
      {
        fontSize: '12px',
        color: '#6de2ce',
        fontStyle: 'bold'
      }
    ).setDepth(21);

    this.values.fuelCells = this.scene.add.text(
      795, 128, '',
      {
        fontSize: '12px',
        color: '#c5a3ff',
        fontStyle: 'bold'
      }
    ).setDepth(21);

    this.update();

    return resources;
  }

  update() {

    const resources = this.resourceManager.getResources();

    this.values.power.setText(
      `POWER: ${resources.electricity} kW`
    );

    this.values.water.setText(
      `WATER: ${resources.water} L`
    );

    this.values.oxygen.setText(
      `OXYGEN: ${resources.oxygen}`
    );

    this.values.fuelCells.setText(
      `FUEL: ${resources.fuelCells}`
    );

    // Low resource warnings.
    this.values.power.setColor(
      resources.electricity <= 10 ? '#ff7777' : '#f6d477'
    );

    this.values.water.setColor(
      resources.water <= 5 ? '#ff7777' : '#64c9ff'
    );

    this.values.oxygen.setColor(
      resources.oxygen <= 5 ? '#ff7777' : '#6de2ce'
    );
  }
}