import React from 'react';
import { useDispatch } from 'react-redux';
import startDrawingLine from '../DrawLine';
import useRedrawCanvas from '../hooks/useRedrawCanvas';
import { MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import useIsWireClicked from '../hooks/useIsWireClicked';

export default function MainCanvas(){
	const dispatch = useDispatch();
	const canvasRef = useRedrawCanvas();
    const checkWire = useIsWireClicked();
	return (
		<>
			<canvas
				id="main-canvas"
				ref={canvasRef}
				onContextMenu={e => {e.preventDefault(); checkWire(e.clientX, e.clientY);}}
				onMouseDown={e => startDrawingLine(e, dispatch)}
				style={{
					backgroundColor: "rgb(100 100 100 / 30%)",
					marginLeft: 3*MINIMAL_BLOCKSIZE,
				}}
			>
        asd
			</canvas>
      
		</>
	);
}