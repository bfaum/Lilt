// Define piano key types
export interface PianoKey {
    note: string;        // Note name (e.g., "C", "F#", "A")
    key: string;         // Keyboard key to press for this note
    frequency: number;   // Frequency in Hz
    type: 'white' | 'black';  // Key type
    position?: string;   // CSS position for black keys
  }
  
  // Define oscillator configuration
  export interface OscillatorConfig {
    type: OscillatorType;  // 'sine', 'square', 'sawtooth', 'triangle'
    detune?: number;       // Detune in cents
    volume?: number;       // Volume from 0 to 1
  }
  
  // Define audio engine state
  export interface AudioEngineState {
    initialized: boolean;
    oscillators: Map<string, OscillatorNode>;
    gainNodes: Map<string, GainNode>;
  }