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
    masterGainNode.gain.value = 0.8