import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { drawLine } from '../drawingFunctions/drawLine';
import { MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';

export default function useRedrawCanvas(){

	const wires = useSelector((state: RootState) => state.objectsSlice.wires);
		
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	  
	useEffect(() => {
		const canvasEle = canvasRef.current;
		if (!canvasRef.current || !canvasEle) return;
		canvasRef.current.height = window.innerHeight *0.8;
		canvasRef.current.width = window.innerWidth *0.8;
		const context = canvasEle.getContext('2d');
		if (!context) return;
		context.clearRect(0, 0, canvasEle.width, canvasEle.height);

		context.strokeStyle = 'black';
		context.lineWidth = 1;
		console.time('drawing dots');
		for(var i = 0;i<canvasEle.width;i+=MINIMAL_BLOCKSIZE){
			for(let j = 0; j<canvasEle.height; j+= MINIMAL_BLOCKSIZE){
				context.strokeRect(i,j,1,1);
				context.fillRect(i,j,1,1);
			}
		}
		console.timeEnd('drawing dots');
		if(!wires) return;
		  for (var i = 0; i < wires.length; i++) {
			drawLine(wires[i].linearLine, context);
			drawLine(wires[i].diagonalLine, context);
		  }

		

	}, [wires]);
	
	return canvasRef;

}