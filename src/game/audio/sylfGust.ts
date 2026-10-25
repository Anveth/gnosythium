export function createSylfGust(context: BaseAudioContext, source: AudioBuffer): AudioBuffer {
  const { sampleRate } = source;
  const duration = Math.max(0.95, source.duration / 0.76 + 0.06);
  const length = Math.ceil(duration * sampleRate);
  const channels = Math.max(2, source.numberOfChannels);
  const output = context.createBuffer(channels, length, sampleRate);
  const airHighpass = 1 / (1 + Math.PI * 2 * 180 / sampleRate);
  const sourceLowpass = 1 - Math.exp(-Math.PI * 2 * 2400 / sampleRate);
  const bassLowpass = 1 - Math.exp(-Math.PI * 2 * 120 / sampleRate);
  let peak = 0;
  for (let channel = 0; channel < channels; channel++) {
    const input = source.getChannelData(channel % source.numberOfChannels);
    const samples = output.getChannelData(channel);
    let random = (0x5f3759df + channel * 739) >>> 0;
    let smoothNoise = 0;
    let previousNoise = 0;
    let filteredAir = 0;
    let smoothSource = 0;
    let softenedSource = 0;
    let bass = 0;
    for (let frame = 0; frame < length; frame++) {
      const time = frame / sampleRate;
      const position = frame * 0.76;
      const index = Math.floor(position);
      const fraction = position - index;
      const original = index < input.length - 1
        ? input[index]! * (1 - fraction) + input[index + 1]! * fraction : 0;
      smoothSource += sourceLowpass * (original - smoothSource);
      softenedSource += sourceLowpass * (smoothSource - softenedSource);
      bass += bassLowpass * (softenedSource - bass);
      const tail = Math.exp(-Math.max(0, time - 0.22) / 0.2);
      const direct = (softenedSource * 1.15 - bass * 0.3) * tail;
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
      const noise = random / 0xffffffff * 2 - 1;
      const airLowpass = 1 - Math.exp(-Math.PI * 2 * (650 + 1500 * Math.exp(-time / 0.045)) / sampleRate);
      smoothNoise += airLowpass * (noise - smoothNoise);
      filteredAir = airHighpass * (filteredAir + smoothNoise - previousNoise);
      previousNoise = smoothNoise;
      const gustEnvelope = 0.62 * (1 - Math.exp(-time / 0.003)) * Math.exp(-time / 0.065);
      const pressurePhase = Math.PI * 2 * (125 * time + 5.4 * (1 - Math.exp(-time / 0.03)));
      const pressure = (Math.sin(pressurePhase) + Math.sin(pressurePhase * 1.71) * 0.24) * 0.14
        * (1 - Math.exp(-time / 0.004)) * Math.exp(-time / 0.075);
      const fade = Math.min(1, time / 0.004, (duration - time) / 0.055);
      const sample = Math.tanh((direct + filteredAir * gustEnvelope + pressure) * 1.15) * fade;
      samples[frame] = sample;
      peak = Math.max(peak, Math.abs(sample));
    }
  }
  const gain = peak > 0.9 ? 0.9 / peak : 1;
  if (gain < 1) {
    for (let channel = 0; channel < channels; channel++) {
      const samples = output.getChannelData(channel);
      for (let frame = 0; frame < length; frame++) samples[frame] = samples[frame]! * gain;
    }
  }
  return output;
}
