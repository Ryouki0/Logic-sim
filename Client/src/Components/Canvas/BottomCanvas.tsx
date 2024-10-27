import React, { useEffect, useRef } from 'react';
import { CANVAS_HEIGHT, CANVAS_OFFSET_LEFT, CANVAS_WIDTH, CANVASTOP_HEIGHT, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

export default function BottomCanvas(){
	const bottomCanvasRef = useRef<HTMLCanvasElement>(null);
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});
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
		    for(let i = 0;i<width;i+=blockSize){
			    for(let j = 0; j<height; j+= blockSize){
				    context.strokeRect(i,j,1,1);
				    context.fillRect(i,j,1,1);
			    }
		    }
		}
	}, [canvasHeight, canvasWidth, blockSize]);
	return (
		<canvas
			ref = {bottomCanvasRef}
			id = 'bottom-canvas'
			style={{
				opacity: 1,
				position: 'absolute',
				left: CANVAS_OFFSET_LEFT,
				top: CANVASTOP_HEIGHT,
				zIndex: -1,
			}}></canvas>
	);
}