
import Phaser from 'phaser';

import { FACILITY_DATA } from '../data/facilities.js';
import FacilityPanel from '../ui/FacilityPanel.js';
import MiniGameManager from './MiniGameManager.js';
import DailyOperationsManager from './DailyOperationsManager.js';

export default class FacilityManager {
  constructor(scene, resourceManager, resourceHUD) {
    this.scene = scene;
    this.resourceManager = resourceManager;
    this.resourceHUD = resourceHUD;

    this.facilities = [];
    this.inspectedFacilities = new Set();

    this.interactionRange = 65;

    this.panel = new FacilityPanel(scene);
    this.miniGameManager = new MiniGameManager(scene);

   this.dailyOperations = new DailyOperationsManager(
    resourceManager,
    scene.crewSurvivalManager,
    scene.emergencyManager
    );
  }

  create() {
    const ox = this.scene.MAP_OFFSET_X;
    const oy = this.scene.MAP_OFFSET_Y;

    this.facilities = FACILITY_DATA.map(data => {
      const worldX = data.x + ox;
      const worldY = data.y + oy;

      const container = this.scene.add.container(
        worldX,
        worldY
      );

      container.setDepth(5);

      const shadow = this.scene.add.ellipse(
        0, 13, 76, 25,
        0x000000, 0.35
      );

      const platform = this.scene.add.rectangle(
        0, 0, 62, 42,
        0x273746
      );

      platform.setStrokeStyle(2, data.color);

      const building = this.scene.add.rectangle(
        0, -3, 43, 25,
        0x455b6b
      );

      building.setStrokeStyle(1, 0xa9c1d0);

      const statusLight = this.scene.add.circle(
        16, -12, 4,
        0x68e7b0
      );

      const identifier = this.scene.add.text(
        0, -3, data.id,
        {
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      const label = this.scene.add.text(
        0, 29, data.id,
        {
          fontSize: '11px',
          color: '#ffffff',
          backgroundColor: '#101923',
          padding: { x: 5, y: 3 }
        }
      ).setOrigin(0.5);

      container.add([
        shadow,
        platform,
        building,
        statusLight,
        identifier,
        label
      ]);

      return {
        ...data,
        x: worldX,
        y: worldY,
        container,
        inspected: false
      };
    });

    this.updateDailyHUD();
  }

  update() {
    const astronaut = this.scene.astronaut;

    if (this.panel.isOpen) {
      this.scene.hud.interactionPrompt.setVisible(false);
      return;
    }

    let nearestFacility = null;
    let nearestDistance = this.interactionRange;

    for (const facility of this.facilities) {
      const distance = Phaser.Math.Distance.Between(
        astronaut.playerBody.x,
        astronaut.playerBody.y,
        facility.x,
        facility.y
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestFacility = facility;
      }
    }

    if (!nearestFacility) {
      this.scene.hud.interactionPrompt.setVisible(false);
      return;
    }

    const prompt = nearestFacility.id === 'LCC'
      ? 'PRESS E: LUNAR COMMAND CENTER'
      : `PRESS E TO INSPECT: ${nearestFacility.id}`;

    this.scene.hud.interactionPrompt.setText(prompt);
    this.scene.hud.interactionPrompt.setVisible(true);

    if (
      Phaser.Input.Keyboard.JustDown(
        astronaut.interactKey
      )
    ) {
      this.open(nearestFacility);
    }
  }

  open(facility) {
    if (this.panel.isOpen) return;

    const scene = this.scene;

    scene.astronaut.playerBody.body.setVelocity(0, 0);

    // Hide sidebar and reset camera for the
    // original full-screen facility interfaces.
    scene.beginFacilityConsole();

    if (!facility.inspected) {
      facility.inspected = true;

      this.inspectedFacilities.add(facility.id);

      scene.hud.setFacilityCount(
        this.inspectedFacilities.size,
        this.facilities.length
      );
    }

    this.panel.open(facility, {
      isActivated: (id) => {
        return this.dailyOperations.isCompleted(id);
      },

      canActivate: (item) => {
        const dailyValidation =
          this.dailyOperations.canOperate(item.id);

        if (!dailyValidation.allowed) {
          return dailyValidation;
        }

        return this.resourceManager.canActivate(item);
      },

      getDailyStatus: () => {
        return this.dailyOperations.getStatus();
      },

      onSleep: () => {
        return this.sleepAtCommandCenter();
      },

      onActivateShelter: () => {
        const result = scene.emergencyManager.activateShelter();

        if (result.success) {
          this.resourceHUD.update();
        }

        return result;
      },

      getEmergencyStatus: () => {
        return scene.emergencyManager.getStatus();
      },

      onClose: () => {
        scene.endFacilityConsole();
      },


    onStartMiniGame: (item, onComplete, onCancel) => {
      return this.startFacilityMiniGame(
        item,
        onComplete,
        onCancel
      );
    },

    // Start Oxygen Generator emergency repair.
    // This is independent of normal daily operations.
    onRepairOxygenGenerator: (onComplete, onCancel) => {
      return this.startOxygenEmergencyRepair(
        onComplete,
        onCancel
      );
    },

    });

    scene.hud.interactionPrompt.setVisible(false);

    if (
      this.inspectedFacilities.size ===
      this.facilities.length
    ) {
      scene.hud.completeObjective();
    }
  }

  startFacilityMiniGame(facility, onComplete, onCancel) {
    const dailyValidation =
      this.dailyOperations.canOperate(facility.id);

    if (!dailyValidation.allowed) {
      return false;
    }

    const resourceValidation =
      this.resourceManager.canActivate(facility);

    if (!resourceValidation.allowed) {
      return false;
    }
    // Mini-games use the original 1000 x 650 screen coordinates.
    // Reset camera scroll so the puzzle appears in the visible area.
    this.scene.cameras.main.setScroll(0, 0);
    return this.miniGameManager.start(
      facility,

      () => {
        const result =
          this.resourceManager.activateFacility(facility);

        if (result.success) {
          const dailyResult =
            this.dailyOperations.recordCompletion(facility.id);

          if (!dailyResult.success) {
            console.error(
              'Daily task registration failed:',
              dailyResult.message
            );
          }

          this.resourceHUD.update();
          this.updateDailyHUD();

          result.message =
            `${dailyResult.message} ${this.formatChanges(result.changes)}`;
        }

        if (onComplete) {
          onComplete(result);
        }
      },

      () => {
        if (onCancel) {
          onCancel();
        }
      }
    );
  }
    // ==========================================
  // OXYGEN GENERATOR EMERGENCY REPAIR
  // ==========================================

  startOxygenEmergencyRepair(onComplete, onCancel) {

    const emergencyStatus =
      this.scene.emergencyManager.getStatus();

    // Verify that an oxygen failure is active.
    if (
      !emergencyStatus ||
      !emergencyStatus.oxygenFailure
    ) {
      return false;
    }

    // Reset camera for the full-screen puzzle.
    this.scene.cameras.main.setScroll(0, 0);

    // Reuse the existing Oxygen Puzzle.
    // No daily task validation or resource cost.
    return this.miniGameManager.start(
      { id: 'OGA' },

      () => {

        // Repair the generator after puzzle completion.
        const result =
          this.scene.emergencyManager.repairOxygenGenerator();

        if (result.success) {
          this.resourceHUD.update();
          this.updateDailyHUD();
        }

        if (onComplete) {
          onComplete(result);
        }
      },

      () => {
        if (onCancel) {
          onCancel();
        }
      }
    );
  }

  formatChanges(changes = {}) {
    const labels = {
      electricity: 'POWER',
      water: 'WATER',
      oxygen: 'OXYGEN',
      fuelCells: 'FUEL CELLS'
    };

    return Object.entries(changes)
      .map(([key, value]) => {
        const sign = value > 0 ? '+' : '';

        const unit = key === 'electricity'
          ? ' kW'
          : key === 'water'
            ? ' L'
            : '';

        return `${labels[key] || key}: ${sign}${value}${unit}`;
      })
      .join(' | ');
  }

  sleepAtCommandCenter() {
    const summary = this.dailyOperations.advanceDay();

    if (!summary.success) {
      return summary;
    }

    this.resourceHUD.update();
    this.updateDailyHUD();

    return summary;
  }

  updateDailyHUD() {
    if (!this.scene.hud) return;

    this.scene.hud.updateDailyStatus(
      this.dailyOperations.getStatus()
    );
  }

  close() {
    this.panel.close();
  }

  get isOpen() {
    return this.panel.isOpen;
  }
}
