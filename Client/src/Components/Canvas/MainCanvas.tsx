import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useDrawWire from '../../hooks/useDrawWire';
import useRedrawCanvas from '../../hooks/useRedrawCanvas';
import { CANVAS_OFFSET_LEFT, } from '../../Constants/defaultDimensions';
import useIsWireClicked from '../../hooks/useIsWireClicked';
import { throttle } from '../../utils/throttle';
import { setCameraOffset, setHoveringOverWire, setSelectedEntity, setSelectedGateId } from '../../state/slices/mouseEvents';
import { changeBluePrintPosition, deleteWire } from '../../state/slices/entities';
import { RootState } from '../../state/store';
import { mockComponent } from 'react-dom/test-utils';
export default function MainCanvas(){
	const canvasRef = useRedrawCanvas();

	const [isRightMouseDown, setIsRightMouseDown] = useState(false);
	const [isWheelDown, setIsWheelDown] = useState(false);
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset});
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize});
	const lineWidth = useSelector((state: RootState) => {return state.misc.lineWidth});
	const hoveringOverWire = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverWire;});
	const {checkWire} = useIsWireClicked();
	const startDrawing = useDrawWire(cameraOffset);
	const dispatch = useDispatch();
	const lastDragCall = useRef<{lastCall: number, lastPos: {x: number, y: number}}>({lastCall: -1, lastPos: {x: 0, y:0}});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const throttledCheckWire = throttle((e: MouseEvent) => {
		const x = e.x - cameraOffset.x;
		const y = e.y - cameraOffset.y;
		const wire = checkWire(x,y, lineWidth);
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
		const {x, y} = {x: e.pageX - cameraOffset.x, y: e.pageY - cameraOffset.y};
		const wire = checkWire(x, y, lineWidth);
		if(!wire || currentComponentId !== 'global'){
			return;
		}
		dispatch(deleteWire(wire.id));
	};

	const drawWire = (e: MouseEvent) => {

		if(e.button === 1){
			setIsWheelDown(true);
			return;
		}

		if(currentComponentId !== 'global'){
			return;
		}
		if(e.button === 0){
			startDrawing(e as unknown as React.MouseEvent<HTMLCanvasElement, MouseEvent>);
			const {x, y} = {x: e.pageX - cameraOffset.x, y: e.pageY - cameraOffset.y};
			const wire = checkWire(x, y, lineWidth);
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
		}else if(e.button === 1){
			setIsWheelDown(false);
			lastDragCall.current.lastCall = -1;
		}
	};

	const dragCanvas = (e:MouseEvent) => {
		if(!isWheelDown) return;
		if(lastDragCall.current.lastCall === -1){
			lastDragCall.current.lastCall = Date.now();
			lastDragCall.current.lastPos = {x: e.pageX, y: e.pageY};
		}else if(Date.now() - lastDragCall.current.lastCall > 16){
			lastDragCall.current.lastCall = Date.now();
		}else{
			return;
		}
		const movementX = e.pageX - lastDragCall.current.lastPos.x;
		const movementY = e.pageY - lastDragCall.current.lastPos.y;
		
    	lastDragCall.current.lastPos = { x: e.pageX, y: e.pageY };
    	dispatch(setCameraOffset({ dx: movementX, dy: movementY }));
		
		
	}
	useEffect(() => {
		canvasRef.current?.addEventListener('mousedown', drawWire);
		canvasRef.current?.addEventListener('contextmenu', handleContextMenu);
		canvasRef.current?.addEventListener('mousemove', throttledCheckWire);
		canvasRef.current?.addEventListener('mousemove', dragCanvas);		
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			canvasRef.current?.removeEventListener('mousedown', drawWire);
			canvasRef.current?.removeEventListener('contextmenu', handleContextMenu);
			canvasRef.current?.removeEventListener('mousemove', throttledCheckWire);
			canvasRef.current?.removeEventListener('mousemove', dragCanvas);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [hoveringOverWire, canvasRef, startDrawing, isWheelDown]);

	return (
		<>
			<canvas
				id="main-canvas"
				ref={canvasRef}
				style={{
					willChange: 'transform',
					backgroundColor: 'rgb(160 160 160 / 80%)',
					position: 'absolute',
					cursor: isWheelDown ? 'grabbing' : 'auto',
					left: 0,
					zIndex: 0,
				}}
			>
			</canvas>
			
		</>
	);
}