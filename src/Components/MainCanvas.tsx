import React from 'react';
import { useDispatch } from 'react-redux';
import startDrawingLine from '../hooks/useDrawWire';
import useRedrawCanvas from '../hooks/useRedrawCanvas';
import { CANVAS_OFFSET_LEFT, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import useIsWireClicked from '../hooks/useIsWireClicked';
import { throttle } from '../utils/throttle';
import { Wire } from '../Interfaces/Wire';
import { setHoverOverWire } from '../state/objectsSlice';

export default function MainCanvas(){
	const canvasRef = useRedrawCanvas();
	const checkWire = useIsWireClicked();
	const dispatch = useDispatch();
	const throttledCheckWire = throttle((x:number, y:number) => {
		const wire = checkWire(x,y);
		if(!wire){
			return;
		}
		hoverOverWire(wire);
	}, 16);
	//TODO: When wires can connect to each other, then implement
	const removeWire = (wire:Wire) => {

	}

	const hoverOverWire = (wire:Wire) => {
		dispatch(setHoverOverWire(wire));
	}

	return (
		<>
			<canvas
				id="main-canvas"
				ref={canvasRef}
				onMouseMove={e => {throttledCheckWire(e.pageX,e.pageY)}}
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