import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';

const EmojiInput = () => {
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className='relative w-full'>
      <input
        type='text'
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Type something... 😊'
        className='border p-2 rounded-lg w-full'
      />
      <button onClick={() => setShowPicker(!showPicker)} className='absolute right-2 top-2'>
        😀
      </button>
      {showPicker && (
        <div className='absolute top-full right-0 z-50'>
          <EmojiPicker onEmojiClick={(emoji) => setText((prev) => prev + emoji.emoji)} />
        </div>
      )}
    </div>
  );
};

export default EmojiInput;

