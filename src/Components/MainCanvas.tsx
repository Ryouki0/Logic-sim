import React from 'react';
import { useDispatch } from 'react-redux';
import startDrawingLine from '../DrawLine';
import useRedrawCanvas from '../hooks/useRedrawCanvas';
import { MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';

export default function MainCanvas(){
	const dispatch = useDispatch();
	const canvasRef = useRedrawCanvas();
    
	return (
		<>
			<canvas
				id="main-canvas"
				ref={canvasRef}
				onMouseDown={e => startDrawingLine(e, dispatch)}
				style={{
					backgroundColor: "rgb(100 100 100 / 30%)",
					marginLeft: MINIMAL_BLOCKSIZE,
				}}
			>
        asd
			</canvas>
      
		</>
	);
}