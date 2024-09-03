import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDrawWire from '../../hooks/useDrawWire';
import useRedrawCanvas from '../../hooks/useRedrawCanvas';
import { CANVAS_OFFSET_LEFT, } from '../../Constants/defaultDimensions';
import useIsWireClicked from '../../hooks/useIsWireClicked';
import { throttle } from '../../utils/throttle';
import { setHoveringOverWire, setSelectedEntity, setSelectedGateId } from '../../state/slices/mouseEvents';
import { changeBluePrintPosition, deleteWire } from '../../state/slices/entities';
import { RootState } from '../../state/store';
export default function MainCanvas(){
	const canvasRef = useRedrawCanvas();

	const [isRightMouseDown, setIsRightMouseDown] = useState(false);

	const hoveringOverWire = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverWire;});
	const {checkWire} = useIsWireClicked();
	const startDrawing = useDrawWire();
	const dispatch = useDispatch();
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const throttledCheckWire = throttle((e: MouseEvent) => {
		const x = e.x;
		const y = e.y;
		const wire = checkWire(x,y);
		if(!isRightMouseDown){
			if(hoveringOverWire && hoveringOverWire?.id === wire?.id){
				return;
			}
			if(hoveringOverWire && !wire){
				dispatch(setHoveringOverWire(null));
				return;
			}else if(wire && hoveringOverWire?.id !== wire.id){
				dispatch(setHoveringOverWire(wire!));
			}
		}else if(wire){
			dispatch(deleteWire(wire.id));
		}
		
	}, 16);

	const handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
		const wire = checkWire(e.pageX, e.pageY);
		if(!wire || currentComponentId !== 'global'){
			return;
		}
		dispatch(deleteWire(wire.id));
	};

	const drawWire = (e: MouseEvent) => {
		if(currentComponentId !== 'global'){
			return;
		}
		if(e.button === 0){
			startDrawing(e as unknown as React.MouseEvent<HTMLCanvasElement, MouseEvent>);
			const wire = checkWire(e.pageX, e.pageY);
			if(!wire){
				return;
			}
			dispatch(setSelectedEntity({type:'Wire', entity: wire}));
		}else if(e.button === 2){
			setIsRightMouseDown(true);
		}
	};

	const handleMouseUp = (e:MouseEvent) => {
		if(e.button === 2){
			setIsRightMouseDown(false);
		}
	};

	useEffect(() => {
		canvasRef.current?.addEventListener('mousedown', drawWire);
		canvasRef.current?.addEventListener('contextmenu', handleContextMenu);
		canvasRef.current?.addEventListener('mousemove', throttledCheckWire);			
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			canvasRef.current?.removeEventListener('mousedown', drawWire);
			canvasRef.current?.removeEventListener('contextmenu', handleContextMenu);
			canvasRef.current?.removeEventListener('mousemove', throttledCheckWire);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [hoveringOverWire, canvasRef, startDrawing]);

	return (
		<>
			<canvas
				id="main-canvas"
				ref={canvasRef}
				style={{
					backgroundColor: 'rgb(160 160 160 / 80%)',
					position: 'absolute',
					left: 0,
					marginLeft: CANVAS_OFFSET_LEFT,
					zIndex: 0,
				}}
			>
			</canvas>
			
		</>
	);
}