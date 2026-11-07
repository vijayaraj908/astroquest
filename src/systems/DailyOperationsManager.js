export default class DailyOperationsManager {
 constructor(
    resourceManager,
    crewSurvivalManager = null,
    emergencyManager = null
    ) {
        this.emergencyManager = emergencyManager;
        this.resourceManager = resourceManager;
        this.crewSurvivalManager = crewSurvivalManager;

        this.day = 1;
        this.completedTasks = new Set();
        this.productionChoice = null;

        this.requiredConsumptionFacilities = [
      'BLSM',
      'LAB',
      'CREW',
      'EVA'
    ];

    this.facilityNames = {
      SOLAR: 'Solar Array & Grid Hub',
      WRS: 'Water Recovery System',
      OGA: 'Oxygen Generation Assembly',
      BLSM: 'Bio-Regenerative Life Support',
      LAB: 'Science Lab & Chemical Synthesizer',
      CREW: 'Crew Quarters & Medical Refuge',
      EVA: 'EVA Preparation Station'
    };
  }

  canOperate(facilityId) {
    if (facilityId === 'LCC') {
      return {
        allowed: true,
        reason: 'Command center available.'
      };
    }

    if (!this.facilityNames[facilityId]) {
      return {
        allowed: false,
        reason: 'No daily operation is configured for this facility.'
      };
    }

    if (this.completedTasks.has(facilityId)) {
      return {
        allowed: false,
        reason: 'This operation has already been completed today.'
      };
    }

    if (facilityId === 'WRS' || facilityId === 'OGA') {
      if (
        this.productionChoice &&
        this.productionChoice !== facilityId
      ) {
        const chosenName = this.productionChoice === 'WRS'
          ? 'Water Recovery'
          : 'Oxygen Generation';

        return {
          allowed: false,
          reason: `${chosenName} was selected today. This production facility is locked until Day ${this.day + 1}.`
        };
      }
    }

    return {
      allowed: true,
      reason: 'Daily operation available.'
    };
  }

  recordCompletion(facilityId) {
    const validation = this.canOperate(facilityId);

    if (!validation.allowed) {
      return {
        success: false,
        message: validation.reason
      };
    }

    if (facilityId === 'WRS' || facilityId === 'OGA') {
      this.productionChoice = facilityId;
    }

    this.completedTasks.add(facilityId);

    return {
      success: true,
      message: `${this.facilityNames[facilityId]} completed for Day ${this.day}.`
    };
  }

  isCompleted(facilityId) {
    return this.completedTasks.has(facilityId);
  }

  isDayComplete() {
    if (
      !this.completedTasks.has('SOLAR') ||
      !this.productionChoice
    ) {
      return false;
    }

    return this.requiredConsumptionFacilities.every(
      id => this.completedTasks.has(id)
    );
  }

  getMissingTasks() {
    const missing = [];

    if (!this.completedTasks.has('SOLAR')) {
      missing.push('SOLAR – Power generation');
    }

    if (!this.productionChoice) {
      missing.push(
        'WRS or OGA – Choose water or oxygen production'
      );
    }

    this.requiredConsumptionFacilities.forEach(id => {
      if (!this.completedTasks.has(id)) {
        missing.push(
          `${id} – ${this.facilityNames[id]}`
        );
      }
    });

    return missing;
  }

  getStatus() {
    return {
      day: this.day,
      completedCount: this.completedTasks.size,
      requiredCount: 6,
      completedTasks: [...this.completedTasks],
      productionChoice: this.productionChoice,

      productionChoiceName: this.productionChoice === 'WRS'
        ? 'WATER'
        : this.productionChoice === 'OGA'
          ? 'OXYGEN'
          : 'NOT SELECTED',

      canSleep: this.isDayComplete(),
      missingTasks: this.getMissingTasks()
    };
  }

 advanceDay() {
    if (!this.isDayComplete()) {
        return {
        success: false,
        message: 'Complete all mandatory daily operations before sleeping.',
        missingTasks: this.getMissingTasks()
        };
    }

    const completedDay = this.day;
    const completedTasks = [...this.completedTasks];
    const productionChoice = this.productionChoice;

    // Process daily crew survival.
    const survivalReport = this.crewSurvivalManager
        ? this.crewSurvivalManager.processEndOfDay()
        : null;
            // Process persistent oxygen generator failure.
    // Apply penalties every day until the generator is repaired.
    let oxygenFailureReport = null;

    const emergencyStatus = this.emergencyManager
        ? this.emergencyManager.getStatus()
        : null;

    const oxygenFailure = emergencyStatus
        ? emergencyStatus.oxygenFailure
        : null;

    if (oxygenFailure && !oxygenFailure.resolved) {

        // Consume 8 oxygen units due to generator failure.
        const oxygenResult = this.resourceManager.consumeResource(
            'oxygen',
            8
        );

        // Apply 10 health damage to the astronaut.
        let actualHealthDamage = 0;

        if (this.crewSurvivalManager) {
            const previousHealth =
                this.crewSurvivalManager.getStatus().health;

            this.crewSurvivalManager.applyDamage(
                10,
                'Unresolved oxygen generator failure'
            );

            const currentHealth =
                this.crewSurvivalManager.getStatus().health;

            actualHealthDamage = previousHealth - currentHealth;
        }

        oxygenFailureReport = {
            active: true,
            oxygenConsumed: oxygenResult.consumed,
            oxygenShortage: oxygenResult.shortage,
            healthDamage: actualHealthDamage,
            message: 'OXYGEN GENERATOR OFFLINE. EMERGENCY REPAIR REQUIRED.'
        };
    }

    // Resolve active emergencies.
    const emergencyReport = this.emergencyManager
        ? this.emergencyManager.resolveEndOfDay()
        : null;

    // Advance the operational day.
    this.day++;

    this.completedTasks.clear();
    this.productionChoice = null;

    // Reset daily facility activations.
    this.resourceManager.resetDailyActivations();

    // Start the next day and check for new emergencies.
    const nextEmergency = this.emergencyManager
        ? this.emergencyManager.startDay(this.day)
        : null;

    // Get updated crew status after emergency resolution.
    const survival = this.crewSurvivalManager
        ? this.crewSurvivalManager.getStatus()
        : survivalReport;

    return {
        success: true,
        completedDay,
        newDay: this.day,
        productionChoice,
        completedTasks,
        resources: this.resourceManager.getResources(),
        survival,
        survivalReport,
        emergencyReport,
        oxygenFailureReport,
        nextEmergency
    };
    }
}
