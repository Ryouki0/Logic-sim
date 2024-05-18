import React from 'react';
import { useDispatch } from 'react-redux';
import startDrawingLine from '../DrawLine';
import useRedrawCanvas from '../hooks/useRedrawCanvas';
import { CANVAS_OFFSET_LEFT, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
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
				onContextMenu={e => {e.preventDefault(); checkWire(e.pageX, e.pageY);}}
				style={{
					backgroundColor: 'rgb(100 100 100 / 30%) ',
					marginLeft: CANVAS_OFFSET_LEFT,
					position: 'absolute',
					zIndex: 0,
				}}
			>
        asd
			</canvas>
		</>
	);
}