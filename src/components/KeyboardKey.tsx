import React from 'react';

type KeyboardKeyProps = {
  note: string;
  keyLabel: string;
  isActive: boolean;
  type: 'white' | 'black';
  positionStyle?: string;
  onKeyDown: () => void;
  onKeyUp: () => void;
};

const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  note,
  keyLabel,
  isActive,
  type,
  positionStyle,
  onKeyDown,
  onKeyUp
}) => {
  // White key classes
  const whiteKeyClasses = `
    flex-1 relative border border-gray-300 flex flex-col justify-end items-center 
    pb-2 cursor-pointer select-none transition-colors duration-75
    ${isActive ? 'bg-blue-200' : 'bg-white hover:bg-gray-50'}
  `;

  // Black key classes
  const blackKeyClasses = `
    absolute w-6 md:w-8 lg:w-12 h-40 cursor-pointer z-10 select-none
    rounded-b-sm transition-colors duration-75
    ${positionStyle || ''}
    ${isActive ? 'bg-blue-700' : 'bg-black hover:bg-gray-800'}
  `;

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onKeyDown();
  };

  const handleMouseUp = () => {
    onKeyUp();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    // Only stop if the mouse button is pressed when leaving
    const isPressing = e.buttons > 0;
    if (isActive && isPressing) {
      onKeyUp();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    onKeyDown();
  };

  const handleTouchEnd = () => {
    onKeyUp();
  };

  return (
    <div
      className={type === 'white' ? whiteKeyClasses : blackKeyClasses}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Note and key label */}
      <div className="flex flex-col items-center absolute bottom-0 left-0 right-0 mb-2">
        <span 
          className={`text-xs font-medium ${
            type === 'white' ? 'text-gray-700' : 'text-white'
          }`}
        >
          {note}
        </span>
        <span 
          className={`text-xs mt-1 px-1 py-0.5 rounded ${
            type === 'white' 
              ? 'text-gray-600 bg-gray-100' 
              : 'text-gray-300 bg-gray-800'
          }`}
        >
          {keyLabel}
        </span>
      </div>
    </div>
  );
};

export default KeyboardKey;