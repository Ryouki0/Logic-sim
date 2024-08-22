import React, { useEffect, useRef } from 'react';

interface TextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  style?: React.CSSProperties;
}

const TextArea: React.FC<TextAreaProps> = ({ value, onChange, style }) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      rows={1}
      spellCheck={false}
      ref={textAreaRef}
      value={value}
      onChange={onChange}
      style={{
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 18,
        border: 'none',
        alignSelf: 'center',
        outline: 'none',
        resize: 'none',
        ...style,
      }}
    />
  );
};

export default TextArea;