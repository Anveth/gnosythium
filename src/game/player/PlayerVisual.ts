import Phaser from 'phaser';
import { MAGE_FRAMES, type MageFrame } from '../art/mageAtlas';
import { HealingAura } from '../art/HealingAura';
import { ArcaneBubble } from '../art/ArcaneBubble';
import { SpellCastEffect, spellCastFrame, spellCastLean, type CastingSpell } from '../art/SpellCastEffect';
import { SPELL_PRESENTATION } from '../art/spellPresentation';
import type { MageMagicKind } from '../art/mageMagicColors';
import { BALANCE, MAGE_ART } from '../config';
import type { Player } from './Player';

type VisualEvent = 'cast' | 'airBurst' | 'groundSmash' | 'groundSmashImpact'
  | 'hurt' | 'jump' | 'doubleJump' | 'land' | 'blockHit' | 'heal';

export class PlayerVisual {
  private readonly root: Phaser.GameObjects.Container;
  private readonly image: Phaser.GameObjects.Image;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private readonly healingAura: HealingAura;
  private readonly bubble: ArcaneBubble;
  private readonly casting: SpellCastEffect;
  private readonly started: Record<VisualEvent, number> = {
    cast: -Infinity, airBurst: -Infinity, hurt: -Infinity, jump: -Infinity,
    groundSmash: -Infinity, groundSmashImpact: -Infinity,
    doubleJump: -Infinity, land: -Infinity, blockHit: -Infinity, heal: -Infinity,
  };
  private now = 0;
  private current: MageFrame = MAGE_FRAMES.idle[0]!;
  private magicKind: MageMagicKind = 'arcane';
  private blockHitAngle = 0;
  private motionMode: 'idle' | 'walk' | 'run' = 'idle';
  private motionStartedAt = 0;
  private readonly syncPosition = (): void => {
    this.root.setPosition(this.player.body.center.x, this.player.body.bottom + 2);
    this.shadow.setPosition(this.root.x, this.root.y - 1);
    this.healingAura.setPosition(this.root.x, this.root.y);
    this.bubble.setPosition(this.root.x, this.root.y);
    this.casting.setPosition(this.root.x, this.root.y);
  };

  constructor(scene: Phaser.Scene, private readonly player: Player) {
    this.image = scene.add.image(0, 0, this.current.sheet, this.current.name);
    this.root = scene.add.container(0, 0, [this.image]).setDepth(10);
    this.shadow = scene.add.ellipse(0, 0, 42, 7, 0x070e0b, 0.35).setDepth(8);
    this.healingAura = new HealingAura(scene);
    this.bubble = new ArcaneBubble(scene);
    this.casting = new SpellCastEffect(scene);
    this.refresh(0);
    scene.events.on(Phaser.Scenes.Events.POST_UPDATE, this.syncPosition);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncPosition);
    });
  }

  play(event: VisualEvent, now: number): void {
    if (event === 'cast') this.magicKind = 'arcane';
    else if (event === 'airBurst') this.magicKind = 'air';
    else if (event === 'groundSmash' || event === 'groundSmashImpact') this.magicKind = 'earth';
    else if (event === 'heal') this.magicKind = 'restoration';
    else if (event === 'blockHit') this.magicKind = 'ward';
    if (event === 'cast' || event === 'airBurst' || event === 'groundSmash' || event === 'groundSmashImpact'
      || event === 'hurt' || event === 'heal') {
      for (const action of ['cast', 'airBurst', 'groundSmash', 'groundSmashImpact', 'hurt', 'heal', 'blockHit'] as const) {
        this.started[action] = -Infinity;
      }
      this.started.land = -Infinity;
    }
    if (event === 'jump' || event === 'doubleJump') {
      this.started.land = -Infinity;
      this.started.groundSmashImpact = -Infinity;
    }
    if (event === 'land') {
      this.started.jump = -Infinity;
      this.started.doubleJump = -Infinity;
    }
    if (event !== 'blockHit') this.motionMode = 'idle';
    this.started[event] = now;
  }

  blockImpact(now: number, sourceX: number, sourceY: number): void {
    this.blockHitAngle = Math.atan2(sourceY - (this.player.body.bottom - 46), sourceX - this.player.body.center.x);
    this.play('blockHit', now);
    this.refresh(now);
  }

  cancel(event: VisualEvent): void {
    this.started[event] = -Infinity;
    if (event === 'heal') this.healingAura.clear();
    if (event === 'airBurst' || event === 'groundSmash') this.casting.clear();
  }

  refresh(now: number): void {
    this.now = now;
    if (this.player.shielding) this.magicKind = 'ward';
    this.current = this.selectFrame(now);
    const spell = this.castingSpell(now);
    const castAge = spell ? now - (spell === 'air' ? this.started.airBurst : this.started.groundSmash) : 0;
    this.image.setRotation(spell ? spellCastLean(spell, castAge) : 0);
    const scale = MAGE_ART.pixelsToWorld * this.current.scale;
    this.root.setScale(this.player.facing * scale, scale).setAlpha(this.player.alpha);
    const [width, height] = [this.current.crop[2], this.current.crop[3]];
    const kind = this.current.name.startsWith('block-') ? 'ward'
      : this.current.name.startsWith('heal-') ? 'restoration' : this.magicKind;
    this.image.setTexture(this.current.magicTextures[kind] ?? this.current.renderTexture ?? this.current.sheet, this.current.name)
      .setOrigin(this.current.anchor[0] / width, this.current.anchor[1] / height);
    this.shadow.setVisible(this.player.grounded && this.player.health > 0);
    this.healingAura.refresh(now - this.started.heal,
      this.player.health > 0 && this.current.name.startsWith('heal-'), BALANCE.healing.channelMs);
    this.syncPosition();
    const tip = this.staffPosition();
    this.bubble.refresh(now, this.player.shielding && this.player.health > 0,
      now - this.started.blockHit, this.blockHitAngle, tip.x - this.root.x, tip.y - this.root.y);
    this.casting.refresh(spell, castAge, tip.x - this.root.x, tip.y - this.root.y);
  }

  get staffTip(): { x: number; y: number } {
    this.refresh(this.now);
    return this.staffPosition();
  }

  private staffPosition(): { x: number; y: number } {
    const offsetX = this.current.orb[0] - this.current.anchor[0];
    const offsetY = this.current.orb[1] - this.current.anchor[1];
    const cosine = Math.cos(this.image.rotation);
    const sine = Math.sin(this.image.rotation);
    return {
      x: this.root.x + (offsetX * cosine - offsetY * sine) * this.root.scaleX,
      y: this.root.y + (offsetX * sine + offsetY * cosine) * this.root.scaleY,
    };
  }

  reset(now: number): void {
    this.magicKind = 'arcane';
    for (const event of Object.keys(this.started) as VisualEvent[]) this.started[event] = -Infinity;
    this.blockHitAngle = 0;
    this.bubble.clear();
    this.casting.clear();
    this.motionMode = 'idle';
    this.motionStartedAt = now;
    this.refresh(now);
  }

  private selectFrame(now: number): MageFrame {
    const { player, started } = this;
    if (player.health <= 0) return MAGE_FRAMES.hurt[1]!;
    const hurtAge = now - started.hurt;
    if (hurtAge < 180) return MAGE_FRAMES.hurt[0]!;
    if (player.groundSmashing) return SPELL_PRESENTATION.casting
      ? spellCastFrame('earth', now - started.groundSmash) : MAGE_FRAMES.jump[3]!;
    const smashImpactAge = now - started.groundSmashImpact;
    if (smashImpactAge < BALANCE.groundSmash.recoveryMs) {
      return MAGE_FRAMES.land[1 + Math.min(2, Math.floor(smashImpactAge / 80))]!;
    }
    const healAge = now - started.heal;
    if (player.healing || healAge < BALANCE.healing.channelMs + 200) {
      const index = healAge < 150 ? 0 : healAge < 300 ? 1 : healAge < 950 ? 2 : healAge < 1050 ? 3 : 4;
      return MAGE_FRAMES.heal[index]!;
    }
    const castAge = now - started.cast;
    const airAge = now - started.airBurst;
    if (airAge < BALANCE.airBurst.animationMs) {
      if (SPELL_PRESENTATION.casting) return spellCastFrame('air', airAge);
      return MAGE_FRAMES.cast[airAge < 180 ? 0 : 3]!;
    }
    if (castAge < BALANCE.bolt.animationMs) {
      const index = castAge < BALANCE.bolt.windupMs ? 0 : castAge < 190 ? 1 : castAge < 250 ? 2 : 3;
      return MAGE_FRAMES.cast[index]!;
    }
    const doubleAge = now - started.doubleJump;
    if (doubleAge < 280) return MAGE_FRAMES.doubleJump[Math.min(3, Math.floor(doubleAge / 70))]!;
    if (!player.grounded) {
      const jumpAge = now - started.jump;
      const index = jumpAge < 100 ? 0 : jumpAge < 180 ? 1 : player.body.velocity.y < 0 ? 2 : 3;
      return MAGE_FRAMES.jump[index]!;
    }
    const landAge = now - started.land;
    if (landAge < 180 && Math.abs(player.body.velocity.x) < 40) {
      return MAGE_FRAMES.land[1 + Math.min(2, Math.floor(landAge / 60))]!;
    }
    const speed = Math.abs(player.body.velocity.x);
    if (speed > 12) {
      const mode = speed > 190 ? 'run' : 'walk';
      if (this.motionMode !== mode) {
        this.motionMode = mode;
        this.motionStartedAt = now;
      }
      const frames = MAGE_FRAMES[mode];
      const phase = Math.floor((now - this.motionStartedAt) / (mode === 'run' ? 85 : 110)) % frames.length;
      return frames[phase]!;
    }
    this.motionMode = 'idle';
    return MAGE_FRAMES.idle[Math.floor(now / 240) % MAGE_FRAMES.idle.length]!;
  }

  private castingSpell(now: number): CastingSpell | undefined {
    if (!SPELL_PRESENTATION.casting || this.player.health <= 0 || this.player.isHurt(now)
      || this.player.healing) return undefined;
    if (this.player.groundSmashing) return 'earth';
    if (now - this.started.airBurst < BALANCE.airBurst.animationMs) return 'air';
    return undefined;
  }
}
