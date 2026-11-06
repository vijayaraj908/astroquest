
import Phaser from 'phaser';

import { FACILITY_DATA } from '../data/facilities.js';
import FacilityPanel from '../ui/FacilityPanel.js';
import MiniGameManager from './MiniGameManager.js';

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
  }

  create() {
    this.facilities = FACILITY_DATA.map(data => {
      const container = this.scene.add.container(
        data.x,
        data.y
      );

      container.setDepth(5);

      const shadow = this.scene.add.ellipse(
        0, 13, 76, 25, 0x000000, 0.35
      );

      const platform = this.scene.add.rectangle(
        0, 0, 62, 42, 0x273746
      );

      platform.setStrokeStyle(2, data.color);

      const building = this.scene.add.rectangle(
        0, -3, 43, 25, 0x455b6b
      );

      building.setStrokeStyle(1, 0xa9c1d0);

      const statusLight = this.scene.add.circle(
        16, -12, 4, 0x68e7b0
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
        container,
        inspected: false
      };
    });
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

    const inspectedLabel = nearestFacility.inspected
      ? 'INSPECTED'
      : 'NEW';

    this.scene.hud.interactionPrompt.setText(
      `PRESS E TO INSPECT: ${nearestFacility.id} (${inspectedLabel})`
    );

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
        return this.resourceManager.isActivated(id);
      },

      canActivate: (item) => {
        return this.resourceManager.canActivate(item);
      },

      onStartMiniGame: (item, onComplete, onCancel) => {
        return this.startFacilityMiniGame(
          item,
          onComplete,
          onCancel
        );
      }
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
    return this.miniGameManager.start(
      facility,

      // Called only after successful puzzle completion.
      () => {
        const result =
          this.resourceManager.activateFacility(facility);

        if (result.success) {
          this.resourceHUD.update();

          if (onComplete) {
            onComplete(result);
          }
        } else {
          if (onComplete) {
            onComplete(result);
          }
        }
      },

      // Called if the player cancels the puzzle.
      () => {
        if (onCancel) {
          onCancel();
        }
      }
    );
  }

  close() {
    this.panel.close();
  }

  get isOpen() {
    return this.panel.isOpen;
  }
}
