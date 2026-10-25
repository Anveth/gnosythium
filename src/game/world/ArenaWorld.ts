import Phaser from 'phaser';
import { ART_SCALE, COLORS, VIEW } from '../config';
import { drawSigil } from '../art/sigil';
import { ARENA } from './arenaData';

export class ArenaWorld {
  readonly platforms: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.drawSky(scene);
    this.drawRuins(scene);
    this.platforms = scene.physics.add.staticGroup();
    const masonry = scene.add.graphics().setDepth(2);
    for (const platform of ARENA.platforms) {
      const body = scene.add.rectangle(
        platform.x + platform.width / 2, platform.y + platform.height / 2,
        platform.width, platform.height, COLORS.stone,
      );
      scene.physics.add.existing(body, true);
      this.platforms.add(body);
      if (body.body instanceof Phaser.Physics.Arcade.StaticBody && platform.y < ARENA.floorY) {
        body.body.checkCollision.down = false;
        body.body.checkCollision.left = false;
        body.body.checkCollision.right = false;
      }
      body.setDepth(1);
      masonry.fillStyle(COLORS.stoneTop).fillRect(platform.x, platform.y, platform.width, 4);
      masonry.fillStyle(0x9d9a7c, 0.2).fillRect(platform.x, platform.y + 4, platform.width, 3);
      masonry.lineStyle(1, 0x101c24, 0.9);
      for (let row = 0; row < Math.ceil(platform.height / 32); row++) {
        const rowY = platform.y + row * 32;
        masonry.lineBetween(platform.x, rowY + 32, platform.x + platform.width, rowY + 32);
        for (let column = 0; column < platform.width; column += 76) {
          const columnX = platform.x + column + (row % 2) * 38;
          if (columnX < platform.x + platform.width) masonry.lineBetween(columnX, rowY, columnX, rowY + 32);
        }
      }
      for (let tuft = 18; tuft < platform.width - 15; tuft += 57) {
        const tuftX = platform.x + tuft;
        masonry.lineStyle(1, 0x698579, 0.55);
        masonry.lineBetween(tuftX, platform.y, tuftX - 4, platform.y - 7);
        masonry.lineBetween(tuftX + 2, platform.y, tuftX + 5, platform.y - 11);
      }
    }
    this.drawLandmarks(scene);
    scene.add.particles(0, 0, 'mote', {
      x: { min: 0, max: ARENA.width },
      y: { min: 300, max: 750 },
      speedY: { min: -12, max: -28 },
      speedX: { min: -9, max: 9 },
      lifespan: 4500,
      frequency: 140,
      scale: { start: 0.55, end: 0 },
      alpha: { start: 0.35, end: 0 },
    }).setDepth(6);
  }

  private drawSky(scene: Phaser.Scene): void {
    const sky = this.parallaxLayer(scene, -30, 0, 0);
    for (let band = 0; band < 90; band++) {
      const progress = band / 89;
      const color = Phaser.Display.Color.GetColor(
        11 + Math.round(26 * progress), 20 + Math.round(39 * progress), 31 + Math.round(33 * progress),
      );
      sky.fillStyle(color).fillRect(0, band * 8, VIEW.width, 8);
    }
    for (let index = 0; index < 90; index++) {
      const pointX = (index * 197 + 43) % VIEW.width;
      const pointY = (index * 73 + 29) % 390;
      sky.fillStyle(0xc4d4ce, 0.12 + (index % 4) * 0.1).fillCircle(pointX, pointY, index % 7 === 0 ? 1.4 : 0.7);
    }
    sky.fillStyle(0x9fc9bf, 0.025).fillCircle(960, 190, 135);
    sky.fillStyle(0x9fc9bf, 0.035).fillCircle(960, 190, 98);
    sky.fillStyle(0xb7cdc0, 0.65).fillCircle(960, 190, 52);
    sky.fillStyle(0x13242c).fillCircle(979, 177, 49);
    const hills = this.parallaxLayer(scene, -25, 0.12, 0.1);
    hills.fillStyle(0x15262e);
    hills.beginPath();
    hills.moveTo(0, 800);
    for (let index = 0; index <= 20; index++) hills.lineTo(index * 180, 400 + Math.sin(index * 1.8) * 72);
    hills.lineTo(3600, 1000).closePath().fillPath();
  }

  private drawRuins(scene: Phaser.Scene): void {
    const ruins = this.parallaxLayer(scene, -20, 0.35, 0.35);
    for (let index = 0; index < 14; index++) {
      const towerX = index * 215 - 50;
      const towerTop = 280 + (index % 3) * 52;
      ruins.fillStyle(index % 2 === 0 ? 0x1b2c34 : 0x1d3038);
      ruins.fillRect(towerX, towerTop, 104, 600);
      ruins.fillTriangle(towerX - 8, towerTop, towerX + 52, towerTop - 90, towerX + 112, towerTop);
      ruins.fillStyle(0x0c1a24, 0.7).fillRoundedRect(towerX + 35, towerTop + 70, 34, 104, 17);
      ruins.lineStyle(2, 0x31464a, 0.55).strokeRect(towerX + 8, towerTop + 6, 88, 580);
      ruins.lineStyle(14, 0x1a2d35).beginPath().arc(towerX + 160, towerTop + 190, 84, Math.PI, 0).strokePath();
    }
    const pillars = scene.add.graphics().setDepth(-4);
    for (const pillarX of [75, 370, 1040, 1530, 1845, 2210, 2670, 2940]) {
      const top = pillarX % 3 === 0 ? 310 : 365;
      pillars.fillStyle(0x1d3036).fillRect(pillarX, top, 46, 740 - top);
      pillars.fillStyle(0x2b4144).fillRect(pillarX + 5, top + 8, 8, 730 - top);
      pillars.fillStyle(0x384c4c).fillRect(pillarX - 7, top, 60, 14);
      pillars.fillStyle(0x2b3e42).fillRect(pillarX - 10, 720, 66, 20);
      pillars.lineStyle(1, 0x55736b, 0.4);
      for (let fracture = top + 70; fracture < 720; fracture += 78) {
        pillars.lineBetween(pillarX, fracture, pillarX + 46, fracture + 5);
      }
    }
    const fog = scene.add.graphics().setDepth(-2);
    fog.fillStyle(0x97c1b4, 0.035).fillEllipse(780, 655, 1400, 110);
    fog.fillStyle(0x97c1b4, 0.025).fillEllipse(2050, 700, 1700, 150);
  }

  private drawLandmarks(scene: Phaser.Scene): void {
    const marks = scene.add.graphics().setDepth(3);
    marks.fillStyle(0x17262d).fillRect(180, 648, 62, 92);
    marks.lineStyle(1, COLORS.gold, 0.45).strokeRect(187, 655, 48, 76);
    drawSigil(marks, 211, 678, 16, COLORS.gold);
    this.label(scene, 210, 620, 'THE FIRST THRESHOLD', 11);
    this.label(scene, 540, 586, 'ASCEND', 11);
    this.label(scene, 850, 373, 'A SEAL ANSWERS TO MAGIC', 11);
    this.label(scene, 1355, 821, 'THE ABYSS', 10);
    marks.lineStyle(1, COLORS.gold, 0.5);
    marks.lineBetween(1320, 804, 1390, 804);
    for (const candleX of [300, 330, 1020, 1650, 1780, 2170, 2720, 2760]) {
      marks.fillStyle(0xbab09a).fillRect(candleX, 726, 4, 14);
      marks.fillStyle(0xe9c889, 0.08).fillCircle(candleX + 2, 723, 22);
      marks.fillStyle(0xe9c889).fillEllipse(candleX + 2, 722, 3, 7);
    }
    marks.fillStyle(0x101d25).fillTriangle(1260, 740, 1260, 960, 1300, 860);
    marks.fillTriangle(1450, 740, 1450, 960, 1410, 850);
  }

  private label(scene: Phaser.Scene, x: number, y: number, text: string, size: number): void {
    scene.add.text(x, y, text, {
      fontFamily: 'Georgia, serif', fontSize: `${size}px`, color: '#b3ac92', letterSpacing: 2,
    }).setOrigin(0.5).setAlpha(0.75).setDepth(3).setResolution(ART_SCALE);
  }

  private parallaxLayer(scene: Phaser.Scene, depth: number, scrollX: number, scrollY: number): Phaser.GameObjects.Graphics {
    return scene.add.graphics().setDepth(depth).setScrollFactor(scrollX, scrollY).setPosition(
      VIEW.width * (VIEW.renderScale - 1) / 2 * (1 - scrollX),
      VIEW.height * (VIEW.renderScale - 1) / 2 * (1 - scrollY),
    );
  }
}
