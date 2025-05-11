import { useEffect, useRef, useState } from 'react';
import KeyboardKey from './KeyboardKey';
import { getAudioContext } from '../utils/audio';

// Define piano key types
type PianoKey = {
  note: string;
  key: string;
  frequency: number;
  type: 'white' | 'black';
  position?: string;
};

const Piano: React.FC = () => {
  // Piano configuration with notes, keyboard bindings, and frequencies
  const pianoKeys: PianoKey[] = [
    { note: 'C', key: 'a', frequency: 261.63, type: 'white' }, // C4
    { note: 'C#', key: 'w', frequency: 277.18, type: 'black', position: 'left-[3%]' },
    { note: 'D', key: 's', frequency: 293.66, type: 'white' },
    { note: 'D#', key: 'e', frequency: 311.13, type: 'black', position: 'left-[10%]' },
    { note: 'E', key: 'd', frequency: 329.63, type: 'white' },
    { note: 'F', key: 'f', frequency: 349.23, type: 'white' },
    { note: 'F#', key: 't', frequency: 369.99, type: 'black', position: 'left-[24%]' },
    { note: 'G', key: 'g', frequency: 392.00, type: 'white' },
    { note: 'G#', key: 'y', frequency: 415.30, type: 'black', position: 'left-[31%]' },
    { note: 'A', key: 'h', frequency: 440.00, type: 'white' },
    { note: 'A#', key: 'u', frequency: 466.16, type: 'black', position: 'left-[38%]' },
    { note: 'B', key: 'j', frequency: 493.88, type: 'white' },
    { note: 'C5', key: 'k', frequency: 523.25, type: 'white' },
    { note: 'C#5', key: 'o', frequency: 554.37, type: 'black', position: 'left-[52%]' },
    { note: 'D5', key: 'l', frequency: 587.33, type: 'white' },
    { note: 'D#5', key: 'p', frequency: 622.25, type: 'black', position: 'left-[59%]' },
    { note: 'E5', key: ';', frequency: 659.25, type: 'white' },
  ];
  
  // State for active keys and waveform type
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  
  // Refs for audio context and oscillators
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  
  // Initialize audio context when component mounts
  useEffect(() => {
    // Create audio context on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = getAudioContext();
      }
      
      // Remove event listeners after initialization
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    
    // Add event listeners for initializing audio context
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      
      // Stop all playing notes
      stopAllNotes();
      
      // Close audio context
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);
  
  // Play a note with the given frequency
  const playNote = (note: string, frequency: number) => {
    // Initialize audio context if not already done
    if (!audioContextRef.current) {
      audioContextRef.current = getAudioContext();
    }
    
    // If note is already playing, don't play it again
    if (oscillatorsRef.current.has(note)) {
      return;
    }
    
    const ctx = audioContextRef.current;
    
    // Create oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Create gain node for envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.01);
    
    // Connect oscillator to gain and gain to destination
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Start oscillator
    oscillator.start();
    
    // Store oscillator and gain node for later use
    oscillatorsRef.current.set(note, oscillator);
    
    // Update active keys
    setActiveKeys(prev => new Set([...prev, note]));
  };
  
  // Stop a playing note
  const stopNote = (note: string) => {
    if (!oscillatorsRef.current.has(note)) {
      return;
    }
    
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    const oscillator = oscillatorsRef.current.get(note);
    if (!oscillator) return;
    
    // Create a new gain node for release
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.7, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    // Disconnect from current gain node and connect to new one
    oscillator.disconnect();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Stop oscillator after release
    oscillator.stop(ctx.currentTime + 0.2);
    
    // Remove oscillator from map
    oscillatorsRef.current.delete(note);
    
    // Update active keys
    setActiveKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  };
  
  // Stop all playing notes
  const stopAllNotes = () => {
    oscillatorsRef.current.forEach((oscillator, note) => {
      stopNote(note);
    });
    oscillatorsRef.current.clear();
    setActiveKeys(new Set());
  };
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent repeat events when key is held down
      if (e.repeat) return;
      
      // Find the piano key that matches the pressed keyboard key
      const key = pianoKeys.find(k => k.key.toLowerCase() === e.key.toLowerCase());
      if (key) {
        e.preventDefault(); // Prevent default keyboard action
        playNote(key.note, key.frequency);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Find the piano key that matches the released keyboard key
      const key = pianoKeys.find(k => k.key.toLowerCase() === e.key.toLowerCase());
      if (key) {
        e.preventDefault(); // Prevent default keyboard action
        stopNote(key.note);
      }
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [waveform]); // Re-run effect when waveform changes
  
  // Handle waveform change
  const handleWaveformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWaveform(e.target.value as OscillatorType);
    // Stop all notes when changing waveform
    stopAllNotes();
  };
  
  // Calculate key positions based on index for proper layout
  const getBlackKeyPosition = (index: number, totalWhiteKeys: number): string => {
    const whiteKeyWidth = 100 / totalWhiteKeys;
    // Position black keys relative to white keys
    const positions = [
      whiteKeyWidth * 0.75,      // C#
      whiteKeyWidth * 1.75,      // D#
      whiteKeyWidth * 3.75,      // F#
      whiteKeyWidth * 4.75,      // G#
      whiteKeyWidth * 5.75,      // A#
      whiteKeyWidth * 7.75,      // C#5
      whiteKeyWidth * 8.75,      // D#5
    ];
    
    return `left-[${positions[index]}%]`;
  };
  
  // Separate white and black keys
  const whiteKeys = pianoKeys.filter(key => key.type === 'white');
  const blackKeys = pianoKeys.filter(key => key.type === 'black');
  
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Controls */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-purple-800">Piano</h2>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="waveform" className="text-sm font-medium text-gray-600">
            Sound:
          </label>
          <select
            id="waveform"
            value={waveform}
            onChange={handleWaveformChange}
            className="text-sm rounded border border-gray-300 px-2 py-1 bg-white"
          >
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Sawtooth</option>
            <option value="triangle">Triangle</option>
          </select>
        </div>
      </div>
      
      {/* Piano keyboard */}
      <div className="relative w-full h-60 bg-gray-100 rounded-lg shadow-lg overflow-hidden">
        {/* White keys */}
        <div className="flex h-full relative">
          {whiteKeys.map((key) => (
            <KeyboardKey
              key={key.note}
              note={key.note}
              keyLabel={key.key}
              isActive={activeKeys.has(key.note)}
              type="white"
              onKeyDown={() => playNote(key.note, key.frequency)}
              onKeyUp={() => stopNote(key.note)}
            />
          ))}
        </div>
        
        {/* Black keys */}
        <div className="absolute top-0 left-0 w-full">
          {blackKeys.map((key, index) => (
            <KeyboardKey
              key={key.note}
              note={key.note}
              keyLabel={key.key}
              isActive={activeKeys.has(key.note)}
              type="black"
              positionStyle={key.position}
              onKeyDown={() => playNote(key.note, key.frequency)}
              onKeyUp={() => stopNote(key.note)}
            />
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-md w-full text-left">
        <h3 className="text-lg font-medium mb-2 text-gray-800">How to Play</h3>
        <p className="text-sm text-gray-600 mb-3">
          Click on the piano keys or use your keyboard to play notes. The keyboard mapping is shown below:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {pianoKeys.map(key => (
            <div key={key.note} className="flex items-center text-sm">
              <span className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">{key.key}</span>
              <span className="ml-2">{key.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Piano;