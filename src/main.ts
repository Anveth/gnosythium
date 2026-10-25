import Phaser from 'phaser';
import { BALANCE, COLORS, VIEW } from './game/config';
import { ArenaScene } from './game/scenes/ArenaScene';
import { GameShell } from './ui/GameShell';
import './style.css';

const shell = new GameShell();

try {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: VIEW.width * VIEW.renderScale,
    height: VIEW.height * VIEW.renderScale,
    backgroundColor: COLORS.sky,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: BALANCE.gravity }, fixedStep: false, debug: false },
    },
    input: { keyboard: false, mouse: { preventDefaultWheel: false } },
    render: { antialias: true, roundPixels: false },
    scene: [new ArenaScene(shell)],
  });
  const onError = (): void => {
    game.scene.pause('Arena');
    shell.fail();
  };
  window.addEventListener('error', onError);
  if (import.meta.hot) import.meta.hot.dispose(() => {
    window.removeEventListener('error', onError);
    game.destroy(true);
  });
} catch (error) {
  console.error(error);
  shell.fail();
}
