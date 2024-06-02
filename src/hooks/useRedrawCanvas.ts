import React, { useEffect, useRef } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { drawLine } from '../drawingFunctions/drawLine';
import { CANVAS_HEIGHT, CANVAS_WIDTH, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { Root, RootOptions } from 'react-dom/client';
import { AMBER, DARK_RED, ORANGE, RED_ORANGE } from '../Constants/colors';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { BinaryOutput } from '../Interfaces/BinaryOutput';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';

const checkWireSourceEquality = (prev:{[key: string]: BinaryInput | BinaryOutput}, next: {[key: string]: BinaryInput | BinaryOutput}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries.length !== nextEntries.length){
		return false;
	}
	for(const [key, from] of prevEntries){
		if(prev[key].state !== next[key].state){
			return false;
		}
		if(prev[key] !== next[key]){
			return false;
		}
	}
	return true;
}

export default function useRedrawCanvas(){

	const wires = useSelector((state: RootState) => state.objectsSlice.wires);
		
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const inputs = useSelector((state: RootState) => {return state.objectsSlice.globalInputs;}, shallowEqual);
	const hoveringOverWire = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverWire});

	//Create a hashmap with the wires' IDs as keys, and the input/output they are connected from as values
	const wireFrom = useSelector((state: RootState) => {
		const wireEntries = Object.entries(state.objectsSlice.wires);
		const wireFrom: {[key:string]: BinaryInput | BinaryOutput} = {};
		for (const [k, w] of wireEntries){
			if(w.from?.gateId){
				wireFrom[k] = state.objectsSlice.gates[w.from.gateId]?.[w.from?.type]?.[w.from.id];
			}else if(w.from){
				wireFrom[k] = state.objectsSlice.globalInputs[w.from.id];
			}
		}
		return wireFrom;
	}, checkWireSourceEquality)

	useEffect(() => {
		const canvasEle = canvasRef.current;
		if (!canvasRef.current || !canvasEle) return;
		canvasRef.current.height = CANVAS_HEIGHT;
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
			if(wireFrom[key]?.state){
				context.strokeStyle = RED_ORANGE;
			}else{
				context.strokeStyle = ORANGE;
			}if(wire.error){
				context.strokeStyle = DARK_RED;
			}if(hoveringOverWire?.id === wire.id){
				line_width = LINE_WIDTH +2;
			}
			
			drawLine(wire.linearLine, context, line_width);
			drawLine(wire.diagonalLine, context, line_width);
		})
		//console.timeEnd('drawing');
	}, [wires, inputs, hoveringOverWire]);
	
	return canvasRef;

}