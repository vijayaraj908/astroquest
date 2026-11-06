
import SolarPuzzle from '../minigames/SolarPuzzle.js';
import WaterPuzzle from '../minigames/WaterPuzzle.js';

export default class MiniGameManager {
  constructor(scene) {
    this.scene = scene;
    this.activeGame = null;
  }

  start(facility, onComplete, onCancel) {
    if (this.activeGame) {
      return false;
    }

    if (!facility) {
      console.error('No facility provided to MiniGameManager.');
      return false;
    }

    const callbacks = {
      complete: () => {
        this.activeGame = null;

        if (onComplete) {
          onComplete();
        }
      },

      cancel: () => {
        this.activeGame = null;

        if (onCancel) {
          onCancel();
        }
      }
    };

    let puzzle = null;

    switch (facility.id) {
      case 'SOLAR':
        puzzle = new SolarPuzzle(
          this.scene,
          callbacks.complete,
          callbacks.cancel
        );
        break;

      case 'WRS':
        puzzle = new WaterPuzzle(
          this.scene,
          callbacks.complete,
          callbacks.cancel
        );
        break;

      default:
        console.warn(
          `No mini-game has been implemented for ${facility.id} yet.`
        );
        return false;
    }

    this.activeGame = puzzle;
    puzzle.start();

    return true;
  }

  isRunning() {
    return this.activeGame !== null;
  }
}
