import React from 'react';
import { DEFAULT_INPUT_DIM } from '../Constants/defaultDimensions';


export default function Square({ size = DEFAULT_INPUT_DIM.width, color = 'blue', borderColor = 'black' }) {
  return (
    <div
      style={{
        width: `${size - (size * 0.07)}px`,
        height: `${size - (size * 0.07)}px`,
        backgroundColor: color,
        border: `${size/5}px solid ${borderColor}`
      }}
    />
  );
}