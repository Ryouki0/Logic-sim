import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { drawLine } from '../drawingFunctions/drawLine';
import { CANVAS_WIDTH_MULTIPLIER, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';

export default function useRedrawCanvas(){

	const wires = useSelector((state: RootState) => state.objectsSlice.wires);
		
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	  
	useEffect(() => {
		const canvasEle = canvasRef.current;
		if (!canvasRef.current || !canvasEle) return;
		canvasRef.current.height = window.innerHeight * CANVAS_WIDTH_MULTIPLIER;
		canvasRef.current.width = window.innerWidth * CANVAS_WIDTH_MULTIPLIER;
		const context = canvasEle.getContext('2d');
		if (!context) return;
		context.clearRect(0, 0, canvasEle.width, canvasEle.height);

		
		if(!wires) return;
		context.strokeStyle = 'rgb(255 165 0 / 100%)';

		for (var i = 0; i < wires.length; i++) {
			//console.log(`from: ${wires[i].from?.state} id: ${wires[i].from?.id}`);
			if(wires[i].from?.state === 1){
				context.strokeStyle = 'rgb(60 179 113)';
			}else{
				context.strokeStyle = 'rgb(255 165 0 / 100%)';
			}
			drawLine(wires[i].linearLine, context);
			drawLine(wires[i].diagonalLine, context);
		}

	}, [wires]);
	
	return canvasRef;

}