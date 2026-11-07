
export default class ResourceHUD {
  constructor(scene, resourceManager, crewSurvivalManager = null) {
    this.scene = scene;
    this.resourceManager = resourceManager;
    this.crewSurvivalManager = crewSurvivalManager;

    this.values = {};
    this.uiObjects = [];
  }

  create() {
    const addText = (x, y, value, color) => {
      const text = this.scene.add.text(
        x, y, value,
        {
          fontFamily: 'monospace',
          fontSize: '12px',
          color,
          fontStyle: 'bold'
        }
      );

      text.setScrollFactor(0);
      text.setDepth(103);

      this.uiObjects.push(text);

      return text;
    };

    this.values.power = addText(
      16, 211, '', '#f6d477'
    );

    this.values.water = addText(
      16, 231, '', '#64c9ff'
    );

    this.values.oxygen = addText(
      16, 251, '', '#6de2ce'
    );

    this.values.fuelCells = addText(
      145, 211, '', '#c5a3ff'
    );

    this.values.food = addText(
      145, 231, '', '#8fdf9b'
    );

    this.values.crewHealth = addText(
      145, 251, '', '#8dffb0'
    );

    this.update();

    return this.resourceManager.getResources();
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

    this.values.food.setText(
      `FOOD: ${resources.food}`
    );

    const survival = this.crewSurvivalManager
      ? this.crewSurvivalManager.getStatus()
      : {
          health: 100,
          condition: 'STABLE'
        };

    this.values.crewHealth.setText(
      `CREW: ${survival.health}%`
    );

    this.values.power.setColor(
      resources.electricity <= 10
        ? '#ff7777'
        : '#f6d477'
    );

    this.values.water.setColor(
      resources.water <= 5
        ? '#ff7777'
        : '#64c9ff'
    );

    this.values.oxygen.setColor(
      resources.oxygen <= 5
        ? '#ff7777'
        : '#6de2ce'
    );

    this.values.food.setColor(
      resources.food <= 6
        ? '#ff7777'
        : '#8fdf9b'
    );

    this.values.crewHealth.setColor(
      survival.health <= 25
        ? '#ff7777'
        : survival.health <= 50
          ? '#ffbd69'
          : '#8dffb0'
    );
  }

  setVisible(visible) {
    this.uiObjects.forEach(object => {
      if (object && object.active) {
        object.setVisible(visible);
      }
    });
  }
}
