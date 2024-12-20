import React, { useEffect, useRef } from 'react';
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, CANVASTOP_HEIGHT, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

export default function BottomCanvas(){
	const bottomCanvasRef = useRef<HTMLCanvasElement>(null);
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	useEffect(() => {
		if(bottomCanvasRef && bottomCanvasRef.current){
			const width =  canvasWidth;
			const height =  canvasHeight;
			bottomCanvasRef.current.width = width;
			bottomCanvasRef.current.height = height;
			const context = bottomCanvasRef.current.getContext('2d');
			if(!context){
				return;
			}
			context.strokeStyle = 'black';
		    context.lineWidth = 1;
			for (let x = cameraOffset.x % blockSize; x < width; x += blockSize) {
				context.beginPath();
				context.moveTo(x, 0);          
				context.lineTo(x, height);  
				context.stroke();
			}
		
			for (let y = cameraOffset.y % blockSize; y < height; y += blockSize) {
				context.beginPath();
				context.moveTo(0, y);         
				context.lineTo(width, y);
				context.stroke();
			}
		}
	}, [canvasHeight, canvasWidth, blockSize, cameraOffset]);
	return (
		<canvas
			ref = {bottomCanvasRef}
			id = 'bottom-canvas'
			style={{
				willChange: 'transform',
				opacity: 0.4,
				position: 'absolute',
				left: 0,
				top: 0,
				zIndex: -2,
			}}></canvas>
	);
}