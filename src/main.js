import Phaser from 'phaser';
import './style.css';

import MenuScene from './scenes/MenuScene.js';
import BriefingScene from './scenes/BriefingScene.js';
import ExplorationScene from './scenes/ExplorationScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 650,
  parent: 'game-container',
  backgroundColor: '#080e1c',

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },

  scene: [
    MenuScene,
    BriefingScene,
    ExplorationScene
  ]
};

new Phaser.Game(config);