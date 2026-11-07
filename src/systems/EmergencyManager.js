
export default class EmergencyManager {
  constructor(resourceManager, crewSurvivalManager) {
    this.resourceManager = resourceManager;
    this.crewSurvivalManager = crewSurvivalManager;

    this.activeEmergency = null;
    this.lastEmergency = null;
    this.emergencyHistory = [];
    // Persistent oxygen generator failure state.
    // Unlike radiation storms, this remains active until repaired.
    this.activeOxygenFailure = null;
    this.lastOxygenFailure = null;
  }

    startDay(day) {

    // First guaranteed radiation storm on Day 2.
    // Later storms occur every fourth day.
    const isStormDay =
      day === 2 || (day > 2 && (day - 2) % 4 === 0);

    // Start radiation storm independently.
    if (isStormDay && !this.activeEmergency) {
      this.activeEmergency = {
        id: `RADIATION_STORM_DAY_${day}`,
        type: 'SOLAR_RADIATION_STORM',
        title: 'SOLAR RADIATION STORM',
        day,
        severity: 'CRITICAL',
        shelterActivated: false,
        resolved: false,
        healthPenalty: 20,
        shelterPowerCost: 8
      };
    }

    // Guaranteed oxygen generator failure on Day 3.
    // This emergency persists until the astronaut repairs it.
    if (
      day === 3 &&
      !this.activeOxygenFailure
    ) {
      this.activeOxygenFailure = {
        id: 'OXYGEN_GENERATOR_FAILURE_DAY_3',
        type: 'OXYGEN_GENERATOR_FAILURE',
        title: 'OXYGEN GENERATOR FAILURE',
        day,
        severity: 'CRITICAL',
        resolved: false,
        generatorOffline: true
      };
    }

    return this.getStatus();
  }

  activateShelter() {
    if (!this.activeEmergency) {
      return {
        success: false,
        message: 'No active radiation emergency.'
      };
    }

    if (this.activeEmergency.shelterActivated) {
      return {
        success: false,
        message: 'Radiation shelter is already activated.'
      };
    }

    const cost = this.activeEmergency.shelterPowerCost;
    const resources = this.resourceManager.getResources();

    if (resources.electricity < cost) {
      return {
        success: false,
        message: `Insufficient power. ${cost} kW required to activate the shelter.`
      };
    }

    const result = this.resourceManager.consumeResource(
      'electricity',
      cost
    );

    if (!result.success || result.shortage > 0) {
      return {
        success: false,
        message: 'Unable to activate radiation shelter.'
      };
    }

    this.activeEmergency.shelterActivated = true;

    return {
      success: true,
      message: 'RADIATION SHELTER ACTIVATED. CREW PROTECTED.',
      powerConsumed: cost
    };
  }
    repairOxygenGenerator() {

    if (!this.activeOxygenFailure) {
      return {
        success: false,
        message: 'No active oxygen generator failure.'
      };
    }

    const repairedFailure = {
      ...this.activeOxygenFailure,
      resolved: true,
      generatorOffline: false,
      repaired: true
    };

    this.lastOxygenFailure = repairedFailure;
    this.emergencyHistory.push(repairedFailure);

    this.activeOxygenFailure = null;

    return {
      success: true,
      message: 'OXYGEN GENERATOR RESTORED. OXYGEN PRODUCTION ONLINE.',
      failure: repairedFailure
    };
  }

  resolveEndOfDay() {
    if (!this.activeEmergency) {
      return null;
    }

    const emergency = this.activeEmergency;

    let healthDamage = 0;
    let outcome = '';

    if (emergency.shelterActivated) {
      outcome = 'CREW PROTECTED BY RADIATION SHELTER.';
    } else {
      healthDamage = emergency.healthPenalty;

      this.crewSurvivalManager.applyDamage(
        healthDamage,
        'Solar radiation storm'
      );

      outcome = 'SHELTER NOT ACTIVATED. CREW SUFFERED RADIATION EXPOSURE.';
    }

    const report = {
      ...emergency,
      resolved: true,
      healthDamage,
      outcome
    };

    this.lastEmergency = report;
    this.emergencyHistory.push(report);
    this.activeEmergency = null;

    return report;
  }

  getStatus() {

    if (!this.activeEmergency) {
      return {
        active: false,
        emergency: null,
        lastEmergency: this.lastEmergency,

        // Separate persistent oxygen emergency status.
        oxygenFailure: this.activeOxygenFailure
          ? { ...this.activeOxygenFailure }
          : null,

        lastOxygenFailure: this.lastOxygenFailure
      };
    }

    return {
      active: true,
      emergency: { ...this.activeEmergency },
      lastEmergency: this.lastEmergency,

      // Oxygen failure can coexist with a radiation storm.
      oxygenFailure: this.activeOxygenFailure
        ? { ...this.activeOxygenFailure }
        : null,

      lastOxygenFailure: this.lastOxygenFailure
    };
  }

  reset() {
    this.activeEmergency = null;
    this.lastEmergency = null;
    this.emergencyHistory = [];

    this.activeOxygenFailure = null;
    this.lastOxygenFailure = null;
  }
}
