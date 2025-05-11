// Singleton audio context
let audioContext: AudioContext | null = null;

// Master volume
let masterGainNode: GainNode | null = null;

// Reverb and other effects
let reverbNode: ConvolverNode | null = null;

/**
 * Get or create the global audio context
 */
export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioContext = new AudioContextClass();
    
    // Create master gain node
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = 0.8;
    masterGainNode.connect(audioContext.destination);
    
    // Initialize reverb if needed
    // createReverb(audioContext);
  }
  
  // Resume the audio context if it was suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  
  return audioContext;
};

/**
 * Get the master gain node
 */
export const getMasterGain = (): GainNode | null => {
  if (!masterGainNode && audioContext) {
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = 0.8;
    masterGainNode.connect(audioContext.destination);
  }
  return masterGainNode;
};

/**
 * Set the master volume
 */
export const setMasterVolume = (volume: number): void => {
  if (masterGainNode) {
    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    masterGainNode.gain.value = clampedVolume;
  }
};

/**
 * Create a note oscillator
 */
export const createOscillator = (
  frequency: number,
  type: OscillatorType = 'sine',
  detune: number = 0
): { oscillator: OscillatorNode; gainNode: GainNode } | null => {
  const ctx = getAudioContext();
  if (!ctx) return null;
  
  const oscillator = ctx.createOscillator();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (detune !== 0) {
    oscillator.detune.setValueAtTime(detune, ctx.currentTime);
  }
  
  // Create a gain node for this oscillator for envelope control
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  
  // Connect oscillator to its gain node
  oscillator.connect(gainNode);
  
  // Connect to master gain or directly to destination
  if (masterGainNode) {
    gainNode.connect(masterGainNode);
  } else {
    gainNode.connect(ctx.destination);
  }
  
  return { oscillator, gainNode };
};

/**
 * Apply attack-release envelope to a gain node
 */
export const applyEnvelope = (
  gainNode: GainNode,
  attackTime: number = 0.01,
  releaseTime: number = 0.1,
  peakVolume: number = 0.7
): void => {
  const ctx = getAudioContext();
  
  // Attack phase
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(peakVolume, ctx.currentTime + attackTime);
};

/**
 * Apply release envelope (for note off)
 */
export const applyRelease = (
  gainNode: GainNode,
  releaseTime: number = 0.1
): void => {
  const ctx = getAudioContext();
  
  // Get current gain value
  const currentGain = gainNode.gain.value;
  
  // Release phase - start from current gain
  gainNode.gain.cancelScheduledValues(ctx.currentTime);
  gainNode.gain.setValueAtTime(currentGain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + releaseTime);
};

/**
 * Create a reverb effect (convolution)
 * Currently commented out as it requires an impulse response buffer
 */
/*
const createReverb = async (ctx: AudioContext): Promise<void> => {
  if (reverbNode) return;
  
  reverbNode = ctx.createConvolver();
  
  try {
    // Load impulse response - this would be a real audio file in production
    const response = await fetch('/reverb-impulse.wav');
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    
    reverbNode.buffer = audioBuffer;
    
    // Connect reverb to output
    reverbNode.connect(ctx.destination);
  } catch (error) {
    console.error('Failed to load reverb impulse response:', error);
    reverbNode = null;
  }
};
*/

/**
 * Clean up audio resources
 */
export const cleanupAudio = (): void => {
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
  
  audioContext = null;
  masterGainNode = null;
  reverbNode = null;
};