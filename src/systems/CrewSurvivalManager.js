
export default class CrewSurvivalManager {
  constructor(resourceManager) {
    this.resourceManager = resourceManager;

    this.health = 100;
    this.maxHealth = 100;

    // Simplified gameplay consumption.
    this.dailyFoodRequirement = 6;

    this.lastReport = null;
  }

  getStatus() {
    let condition = 'STABLE';

    if (this.health <= 0) {
      condition = 'INCAPACITATED';
    } else if (this.health <= 25) {
      condition = 'CRITICAL';
    } else if (this.health <= 50) {
      condition = 'WEAK';
    } else if (this.health <= 75) {
      condition = 'FAIR';
    }

    return {
      health: this.health,
      maxHealth: this.maxHealth,
      condition,
      dailyFoodRequirement: this.dailyFoodRequirement
    };
  }

  
    applyDamage(amount, reason = 'Unknown emergency') {
    if (!Number.isFinite(amount) || amount <= 0) {
        return this.getStatus();
    }

    const previousHealth = this.health;

    this.health = Math.max(
        0,
        this.health - amount
    );

    this.lastReport = {
        ...(this.lastReport || {}),
        previousHealth,
        health: this.health,
        healthChange: this.health - previousHealth,
        condition: this.getStatus().condition,
        emergencyDamage: amount,
        emergencyReason: reason
    };

    return this.getStatus();
    }


  processEndOfDay() {
    const resourcesBefore =
      this.resourceManager.getResources();

    const availableFood = Math.max(
      0,
      resourcesBefore.food || 0
    );

    const foodConsumed = Math.min(
      availableFood,
      this.dailyFoodRequirement
    );

    this.resourceManager.consumeResource(
      'food',
      foodConsumed
    );

    const foodShortage =
      this.dailyFoodRequirement - foodConsumed;

    const penalties = [];
    let healthChange = 0;

    if (foodShortage > 0) {
      healthChange -= 12;

      penalties.push(
        `Food shortage: ${foodShortage} units missing (-12 health)`
      );
    }

    // Water and oxygen are already consumed by
    // the daily facility operations.
    // These checks do not consume them again.

    if (resourcesBefore.water <= 5) {
      healthChange -= 8;
      penalties.push('Critical water reserves (-8 health)');
    }

    if (resourcesBefore.oxygen <= 5) {
      healthChange -= 15;
      penalties.push('Critical oxygen reserves (-15 health)');
    }

    if (resourcesBefore.electricity <= 5) {
      healthChange -= 5;
      penalties.push('Critical power reserves (-5 health)');
    }

    // Small recovery when all survival requirements are met.
    if (healthChange === 0 && foodShortage === 0) {
      healthChange = 2;
    }

    const previousHealth = this.health;

    this.health = Math.max(
      0,
      Math.min(
        this.maxHealth,
        this.health + healthChange
      )
    );

    const resourcesAfter =
      this.resourceManager.getResources();

    const status = this.getStatus();

    this.lastReport = {
      previousHealth,
      health: this.health,
      healthChange: this.health - previousHealth,
      condition: status.condition,
      foodConsumed,
      foodShortage,
      remainingFood: resourcesAfter.food,
      penalties,
      resources: resourcesAfter
    };

    return {
      ...this.lastReport,
      penalties: [...penalties]
    };
  }

  reset() {
    this.health = this.maxHealth;
    this.lastReport = null;
  }
}
