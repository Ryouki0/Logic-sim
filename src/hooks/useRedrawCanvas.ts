import React, { useEffect, useRef } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { drawLine } from '../drawingFunctions/drawLine';
import { CANVAS_WIDTH_MULTIPLIER, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { Root } from 'react-dom/client';
import { ORANGE, RED_ORANGE } from '../Constants/colors';

export default function useRedrawCanvas(){

	const wires = useSelector((state: RootState) => state.objectsSlice.wires);
		
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const inputs = useSelector((state: RootState) => {return state.objectsSlice.currentInputs}, shallowEqual);
	useEffect(() => {
		const canvasEle = canvasRef.current;
		if (!canvasRef.current || !canvasEle) return;
		canvasRef.current.height = window.innerHeight * CANVAS_WIDTH_MULTIPLIER;
		canvasRef.current.width = window.innerWidth * CANVAS_WIDTH_MULTIPLIER;
		const context = canvasEle.getContext('2d');
		if (!context) return;
		context.clearRect(0, 0, canvasEle.width, canvasEle.height);

		
		if(!wires) return;
		context.strokeStyle = ORANGE;
		//console.time('drawing');
		for (var i = 0; i < wires.length; i++) {
			if(inputs[wires[i].from?.id??0]?.state === 1){
				context.strokeStyle = RED_ORANGE;
			}else{
				context.strokeStyle = ORANGE;
			}
			drawLine(wires[i].linearLine, context);
			drawLine(wires[i].diagonalLine, context);
		}
		//console.timeEnd('drawing');
	}, [wires, inputs]);
	
	return canvasRef;

}