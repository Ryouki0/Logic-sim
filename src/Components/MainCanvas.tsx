import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDrawWire from '../hooks/useDrawWire';
import useRedrawCanvas from '../hooks/useRedrawCanvas';
import { CANVAS_OFFSET_LEFT, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import useIsWireClicked from '../hooks/useIsWireClicked';
import { throttle } from '../utils/throttle';
import { Wire } from '../Interfaces/Wire';
import { setHoveringOverWire, setSelectedEntity } from '../state/slices/mouseEventsSlice';
import { getClosestBlock } from '../Constants/defaultDimensions';
import { deleteWire } from '../state/slices/entities';
import { FRENCH_GREY } from '../Constants/colors';
import { RootState } from '../state/store';
export default function MainCanvas(){
	const canvasRef = useRedrawCanvas();
	const hoveringOverWire = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverWire});
	const {checkWire} = useIsWireClicked();
	const startDrawing = useDrawWire();
	const dispatch = useDispatch();
	const throttledCheckWire = throttle((e: MouseEvent) => {
		const x = e.x;
		const y = e.y;
		const wire = checkWire(x,y);
		if(hoveringOverWire && hoveringOverWire?.id === wire?.id){
			return;
		}
		if(hoveringOverWire && !wire){
			dispatch(setHoveringOverWire(null));
			return;
		}else if(wire && hoveringOverWire?.id !== wire.id){
			dispatch(setHoveringOverWire(wire!));
		}
	}, 16);

	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault(); 
		const wire = checkWire(e.pageX, e.pageY);
		if(!wire){
			return;
		}
		dispatch(deleteWire(wire.id));
	};

	const drawWireFromWire = (e: MouseEvent) => {
		if(e.button !== 0){
			return;
		}
		e.preventDefault();
		const wire = checkWire(e.pageX, e.pageY);
		if(!wire){
			return;
		}
		dispatch(setSelectedEntity({type:'Wire', entity: wire}));
		
		startDrawing(e as unknown as React.MouseEvent<HTMLCanvasElement, MouseEvent>, wire.from, wire);
	};

	useEffect(() => {
		canvasRef.current?.addEventListener('mousedown', drawWireFromWire)
		canvasRef.current?.addEventListener('contextmenu', handleContextMenu)
		canvasRef.current?.addEventListener('mousemove', throttledCheckWire)

		return () => {
			canvasRef.current?.removeEventListener('mousedown', drawWireFromWire);
			canvasRef.current?.removeEventListener('contextmenu', handleContextMenu);
			canvasRef.current?.removeEventListener('mousemove', throttledCheckWire);
		}
	}, [hoveringOverWire, canvasRef, startDrawing])

	return (
		<>
			<canvas
				id="main-canvas"
				ref={canvasRef}
				style={{
					backgroundColor: 'rgb(208 204 208 / 80%)',
					marginLeft: CANVAS_OFFSET_LEFT,
					position: 'absolute',
					zIndex: 0,
				}}
			>
			</canvas>
		</>
	);
}