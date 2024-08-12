import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { drawLine } from '../drawingFunctions/drawLine';
import { CANVAS_WIDTH, LINE_WIDTH } from '../Constants/defaultDimensions';
import { DARK_RED, ORANGE, RED_ORANGE } from '../Constants/colors';
import { BinaryIO } from '../Interfaces/BinaryIO';

const checkWireSourceEquality = (prev:{[key: string]: BinaryIO|null}, next: {[key: string]: BinaryIO|null}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries.length !== nextEntries.length){
		return false;
	}
	for(const [key, from] of prevEntries){
		if(prev[key]?.state !== next[key]?.state){
			return false;
		}
		if(prev[key] !== next[key]){
			return false;
		}
	}
	return true;
};

export default function useRedrawCanvas(){

	const wires = useSelector((state: RootState) => state.entities.currentComponent.wires);
		
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const hoveringOverWire = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverWire;});
	const drawingWire = useSelector((state:RootState) => {return state.mouseEventsSlice.drawingWire;});
	//Create a hashmap with the wires' IDs as keys, and the input/output they are connected from as values
	const wireSources = useSelector((state:RootState) => {
		const wireEntries = Object.entries(state.entities.currentComponent.wires);
		const sourceMap: {[key: string]: BinaryIO|null} = {};
		for(const [key, wire] of wireEntries){
			const source = state.entities.currentComponent.binaryIO[wire.from?.id!];
			sourceMap[key] = source;
		}
		return sourceMap;
	}, checkWireSourceEquality);

	useEffect(() => {
		const canvasEle = canvasRef.current;
		if (!canvasRef.current || !canvasEle) return;
		canvasRef.current.height = window.innerHeight;
		canvasRef.current.width = CANVAS_WIDTH;
		const context = canvasEle.getContext('2d');
		if (!context) return;
		context.clearRect(0, 0, canvasEle.width, canvasEle.height);

		
		if(!wires) return;
		context.strokeStyle = ORANGE;
		//console.time('drawing');
		let line_width = LINE_WIDTH;
		
		Object.entries(wires).forEach(([key, wire]) => {
			line_width = LINE_WIDTH;
			
			
			context.strokeStyle = 'rgb(255, 155, 30)'; //'rgb(255, 170, 51)';
			if(hoveringOverWire?.id === wire.id){
				line_width = LINE_WIDTH +2;
			}if(wireSources[key]?.state){
				context.strokeStyle = RED_ORANGE;
			}if(wire.error){
				context.strokeStyle = DARK_RED;
			}
			
			drawLine(wire.linearLine, context, line_width);
			drawLine(wire.diagonalLine, context, line_width);
		});
		//console.timeEnd('drawing');
	}, [wires, hoveringOverWire, wireSources]);
	return canvasRef;

}