
import SolarPuzzle from '../minigames/SolarPuzzle.js';
import WaterPuzzle from '../minigames/WaterPuzzle.js';
import OxygenPuzzle from '../minigames/OxygenPuzzle.js';
import CO2Puzzle from '../minigames/CO2Puzzle.js';
import LABPuzzle from '../minigames/LABPuzzle.js';
import CREWPuzzle from '../minigames/CREWPuzzle.js';
import EVAPuzzle from '../minigames/EVAPuzzle.js';

export default class MiniGameManager {
  constructor(scene) {
    this.scene = scene;
    this.activeGame = null;
    this.activeCancel = null;
  }

  start(facility, onComplete, onCancel) {
    if (this.activeGame) {
      return false;
    }

    if (!facility) {
      console.error(
        'No facility provided to MiniGameManager.'
      );
      return false;
    }

    const callbacks = {
      complete: () => {
        this.activeGame = null;
        this.activeCancel = null;

        if (onComplete) {
          onComplete();
        }
      },

      cancel: () => {
        this.activeGame = null;
        this.activeCancel = null;

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

      case 'OGA':
        puzzle = new OxygenPuzzle(
          this.scene,
          callbacks.complete,
          callbacks.cancel
        );
        break;

      case 'BLSM':
        puzzle = new CO2Puzzle(
          this.scene,
          callbacks.complete,
          callbacks.cancel
        );
        break;

      case 'LAB':
        puzzle = new LABPuzzle(
          this.scene,
          callbacks.complete,
          callbacks.cancel
        );
        break;

      case 'CREW':
        puzzle = new CREWPuzzle(
          this.scene,
          callbacks.complete,
          callbacks.cancel
        );
        break;

      case 'EVA':
        puzzle = new EVAPuzzle(
          this.scene,
          callbacks.complete,
          callbacks.cancel
        );
        break;

      default:
        console.warn(
          `No mini-game implemented for facility: ${facility.id}`
        );
        return false;
    }

    this.activeGame = puzzle;
    this.activeCancel = callbacks.cancel;

    try {
      puzzle.start();
    } catch (error) {
      console.error(
        'Mini-game startup failed:',
        error
      );

      if (puzzle.destroy) {
        puzzle.destroy();
      }

      this.activeGame = null;
      this.activeCancel = null;

      return false;
    }

    return true;
  }

  // Cancel the currently running mini-game.
  cancelActive() {
    if (!this.activeGame) {
      return false;
    }

    const game = this.activeGame;
    const cancelCallback = this.activeCancel;

    // Clear references before invoking callbacks.
    this.activeGame = null;
    this.activeCancel = null;

    // Remove all puzzle graphics.
    if (game && typeof game.destroy === 'function') {
      game.destroy();
    }

    // Notify FacilityPanel that the puzzle was cancelled.
    if (cancelCallback) {
      cancelCallback();
    }

    return true;
  }

  isRunning() {
    return this.activeGame !== null;
  }
}
