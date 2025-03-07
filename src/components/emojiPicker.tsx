import { useEffect, forwardRef } from 'react';
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';

interface EmojiPickerComponentProps {
  theme: 'light' | 'dark' | 'original';
  onSelect: (emoji: EmojiClickData) => void;
  onClose: () => void;
}

const EmojiPickerComponent = forwardRef<HTMLDivElement, EmojiPickerComponentProps>(
  ({ theme, onSelect, onClose }, ref) => {
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [onClose, ref]);

    return (
      <div ref={ref}>
        <EmojiPicker
          theme={theme === 'light' ? Theme.LIGHT : Theme.DARK}
          className='scrollbar'
          emojiStyle={EmojiStyle.NATIVE}
          onEmojiClick={onSelect}
          previewConfig={{
            defaultEmoji: '1f373',
            defaultCaption: 'Cook your code, code your mood...',
            showPreview: true,
          }}
        />
      </div>
    );
  },
);

export default EmojiPickerComponent;

