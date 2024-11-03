import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { drawLine } from '../drawingFunctions/drawLine';
import { CANVAS_WIDTH, LINE_WIDTH } from '../Constants/defaultDimensions';
import { DARK_RED, DEFAULT_WIRE_COLOR, ORANGE, RED_ORANGE } from '../Constants/colors';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { SourceMap } from 'module';
import { adjustBrightness } from '../utils/adjustBrightness';
import { Root } from 'react-dom/client';

export const checkWireSourceEquality = (prev:{[key: string]: BinaryIO[]|undefined}, next: {[key: string]: BinaryIO[]|undefined}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries.length !== nextEntries.length){
		return false;
	}
	for(const [key, sourceList] of prevEntries){
		if(sourceList?.length !== next[key]?.length){
			return false;
		}
		if(!sourceList){
			return false;
		}
		
		for(const [idx, source] of sourceList!.entries()){
			if(source?.state !== next[key]?.[idx]?.state){
				return false;
			}
			if(source?.highImpedance !== next[key]?.[idx]?.highImpedance){
				return false;
			}
			if(source !== next[key]?.[idx]){
				return false;
			}
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
		const sourceMap: {[key: string]: BinaryIO[]|undefined} = {};
		for(const [key, wire] of wireEntries){
			const source = wire.from?.map(from => {
				return state.entities.currentComponent.binaryIO[from.id!];
			});
			sourceMap[key] = source;
		}
		return sourceMap;
	}, checkWireSourceEquality);

	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset});
	useEffect(() => {
		const canvasEle = canvasRef.current;
		if (!canvasRef.current || !canvasEle) return;
		canvasRef.current.height = canvasHeight;
		canvasRef.current.width = canvasWidth;
		const context = canvasEle.getContext('2d');
		if (!context) return;
		context.clearRect(0, 0, canvasEle.width, canvasEle.height);
		const findTrueSource = (key: string) => {
			
			if(wireSources[key] && wireSources[key]!.length > 0){
				for(const [idx, source] of wireSources[key]!.entries()){
					if(!source?.highImpedance){
						return source;
					}
				}
				return wireSources[key]?.find(source => source.highImpedance);
			}else if(!wireSources[key]){
				return null;
			}

		};
		
		if(!wires) return;
		context.strokeStyle = ORANGE;
		//console.time('drawing');
		let line_width = LINE_WIDTH;
		
		Object.entries(wires).forEach(([key, wire]) => {
			line_width = LINE_WIDTH;
			
			const trueSource = findTrueSource(key);
			context.strokeStyle = DEFAULT_WIRE_COLOR; //'rgb(255, 170, 51)';
			if(hoveringOverWire?.id === wire.id){
				line_width = LINE_WIDTH +2;
			}if(trueSource?.state){
				context.strokeStyle = adjustBrightness(DEFAULT_WIRE_COLOR, 20);//'rgb(255 200 0)';
			}if(trueSource?.highImpedance){
				context.strokeStyle = 'rgb(100 100 100)';
			}
			if(wire.error){
				context.strokeStyle = DARK_RED;
			}
			
			drawLine(wire.linearLine, context, line_width, cameraOffset);
			drawLine(wire.diagonalLine, context, line_width, cameraOffset);
		});
		//console.timeEnd('drawing');
	}, [wires, hoveringOverWire, wireSources, canvasHeight, canvasWidth, cameraOffset]);
	return canvasRef;

}