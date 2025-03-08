import { useEffect, useRef, useState } from 'react';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';

interface EmojiPickerComponentProps {
  theme: 'light' | 'dark' | 'original';
  onSelect: (emoji: EmojiClickData) => void;
  onClose: () => void; // Callback to close the picker
}

const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({
  theme,
  onSelect,
  onClose,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={pickerRef}>
      <EmojiPicker
        theme={theme === 'light' ? Theme.LIGHT : Theme.DARK}
        className='scrollbar'
        emojiStyle={EmojiStyle.NATIVE}
        onEmojiClick={(emoji) => onSelect(emoji)}
        previewConfig={{
          defaultEmoji: '1f373',
          defaultCaption: 'Cook your code, code your mood...',
          showPreview: true,
        }}
      />
    </div>
  );
};

export default EmojiPickerComponent;
