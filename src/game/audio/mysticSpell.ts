interface Bell {
  start: number;
  frequency: number;
  decay: number;
  gain: number;
}

const BELLS: readonly Bell[] = [
  { start: 0.01, frequency: 587.33, decay: 0.6, gain: 0.038 },
  { start: 0.11, frequency: 880, decay: 0.65, gain: 0.03 },
  { start: 0.3, frequency: 1174.66, decay: 0.75, gain: 0.015 },
];

const REFLECTIONS = [
  { seconds: 0.073, gain: 0.12 },
  { seconds: 0.127, gain: 0.09 },
  { seconds: 0.193, gain: 0.065 },
  { seconds: 0.317, gain: 0.04 },
  { seconds: 0.449, gain: 0.025 },
] as const;

function harmonics(time: number, duration: number, channel: number): number {
  const root = 293.66;
  const detune = channel % 2 === 0 ? 1.0012 : 0.9988;
  const breath = 0.92 + Math.sin(time * Math.PI * 2 * 0.7) * 0.08;
  const envelope = (1 - Math.exp(-time / 0.055)) * Math.exp(-time / (duration * 0.42));
  const phase = time * root * detune * Math.PI * 2;
  let tone = (Math.sin(phase) * 0.016 + Math.sin(phase * 1.5) * 0.019
    + Math.sin(phase * 2) * 0.01) * breath * envelope;
  for (const bell of BELLS) {
    const age = time - bell.start;
    if (age < 0) continue;
    const bellEnvelope = (1 - Math.exp(-age / 0.012)) * Math.exp(-age / bell.decay);
    const bellPhase = age * bell.frequency * detune * Math.PI * 2;
    tone += (Math.sin(bellPhase) + Math.sin(bellPhase * 2) * 0.16
      + Math.sin(bellPhase * 3) * 0.06) * bellEnvelope * bell.gain;
  }
  return tone;
}

export function refineMysticShield(context: BaseAudioContext, source: AudioBuffer): AudioBuffer {
  const { length, sampleRate, numberOfChannels, duration } = source;
  const output = context.createBuffer(numberOfChannels, length, sampleRate);
  const dry = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
  const highpass = 1 / (1 + Math.PI * 2 * 160 / sampleRate);
  const lowpass = 1 - Math.exp(-Math.PI * 2 * 7200 / sampleRate);
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const input = source.getChannelData(channel);
    const samples = dry[channel]!;
    let previous = 0;
    let filteredHigh = 0;
    let previousHigh = 0;
    let filteredBody = 0;
    let filteredLow = 0;
    for (let frame = 0; frame < length; frame++) {
      const sample = input[frame]!;
      filteredHigh = highpass * (filteredHigh + sample - previous);
      filteredBody = highpass * (filteredBody + filteredHigh - previousHigh);
      previousHigh = filteredHigh;
      filteredLow += lowpass * (filteredBody - filteredLow);
      previous = sample;
      samples[frame] = filteredBody * 0.15 + filteredLow * 0.85
        + harmonics(frame / sampleRate, duration, channel);
    }
  }
  const taps = REFLECTIONS.map((reflection, index) => ({
    frames: Math.round(reflection.seconds * sampleRate), gain: reflection.gain, cross: index % 2 === 0,
  }));
  const damping = 1 - Math.exp(-Math.PI * 2 * 3100 / sampleRate);
  const drive = 1.05;
  let peak = 0;
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const samples = output.getChannelData(channel);
    const direct = dry[channel]!;
    const opposite = dry[(channel + 1) % numberOfChannels]!;
    let diffuse = 0;
    for (let frame = 0; frame < length; frame++) {
      let reflection = 0;
      for (const tap of taps) {
        const delayed = frame - tap.frames;
        if (delayed >= 0) reflection += (tap.cross ? opposite[delayed]! : direct[delayed]!) * tap.gain;
      }
      diffuse += damping * (reflection - diffuse);
      const fadeIn = Math.min(1, frame / (sampleRate * 0.004));
      const fadeOut = Math.min(1, (length - 1 - frame) / (sampleRate * 0.07));
      const sample = Math.tanh((direct[frame]! + diffuse) * drive) * fadeIn * fadeOut;
      samples[frame] = sample;
      peak = Math.max(peak, Math.abs(sample));
    }
  }
  const normalization = Math.min(3, 0.88 / Math.max(peak, 0.0001));
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const samples = output.getChannelData(channel);
    for (let frame = 0; frame < length; frame++) samples[frame] = samples[frame]! * normalization;
  }
  return output;
}
