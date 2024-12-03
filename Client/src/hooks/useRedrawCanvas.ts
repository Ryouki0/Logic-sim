import React, { useEffect, useMemo, useRef } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { drawLine } from '../drawingFunctions/drawLine';
import { CANVAS_WIDTH, LINE_WIDTH } from '../Constants/defaultDimensions';
import { DARK_RED, DEFAULT_HIGH_IMPEDANCE_COLOR, DEFAULT_WIRE_COLOR, ORANGE, RED_ORANGE } from '../Constants/colors';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { adjustBrightness } from '../utils/adjustBrightness';
import { createSelector } from '@reduxjs/toolkit';
import { Wire } from '@Shared/interfaces';
import { checkWireEquality } from './useConnecting';
import { blendColors } from '../utils/blendColors';

export const checkWireSourceEquality = (prev:{[key: string]: BinaryIO[]|undefined} | null, next: {[key: string]: BinaryIO[]|undefined} | null) => {
	if(!prev || !next) return false;
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
	const prevWires = useRef<{[key: string]: Wire} | null>(null);
	const currentWires = useRef<{[key: string]: Wire} | null>(null);
	const areWirePositionsEqual = useMemo(() => {
		return checkWireEquality(prevWires.current, wires);
	}, [wires])

	const binaryIO = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO});
	const currentBinaryIO = useRef<{[key: string]: BinaryIO} | null>(null);
	const prevBinaryIO = useRef<{[key: string]: BinaryIO} | null>(null);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const hoveringOverWire = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverWire;});
	const lineWidth = useSelector((state: RootState) => {return state.misc.lineWidth;});
	
	//Create a hashmap with the wires' IDs as keys, and the input/output they are connected from as values
	const wireSources = useMemo(() => {
		const sourceMap: { [key: string]: BinaryIO[] | undefined } = {};
		  	for(const [key, wire] of Object.entries(wires)) {
				const source = wire.from?.map(from => binaryIO[from.id!]);
				sourceMap[key] = source;
		}
		return sourceMap;
	}, [wires, binaryIO])
	
	const prevWireSources = useRef<{[key: string]: BinaryIO[] | undefined} | null>(null);
	const currentWireSources = useRef<{[key: string]: BinaryIO[] | undefined} | null>(null);
	const areWireSourcesEqual = useMemo(() => {
		const isEqual = checkWireSourceEquality(prevWireSources.current, wireSources);
		return isEqual;
	}, [wireSources])

	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const animationFrame = useRef<number>(0);

	useEffect(() => {
		prevWireSources.current = currentWireSources.current;
		currentWireSources.current = wireSources;

		prevBinaryIO.current = currentBinaryIO.current;
		currentBinaryIO.current = binaryIO;

		prevWires.current = currentWires.current;
		currentWires.current = wires;
	}, [hoveringOverWire, areWireSourcesEqual, areWirePositionsEqual, cameraOffset, wires, binaryIO,canvasHeight, canvasWidth])

	function draw(){
		const canvasEle = canvasRef.current;
		if (!canvasRef.current || !canvasEle) return;
		
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
		const wireEntries = Object.entries(wires);
		let line_width = lineWidth;
		wireEntries.forEach(([key, wire]) => {
			line_width = lineWidth;
			
			const trueSource = findTrueSource(key);
			const color = trueSource?.wireColor ?? (wire.color ?? DEFAULT_WIRE_COLOR);
			context.strokeStyle = color;
			if(hoveringOverWire?.id === wire.id){
				line_width = lineWidth + (lineWidth * 0.25);
			}if(trueSource?.state){
				context.strokeStyle = adjustBrightness(color, 20);//'rgb(255 200 0)';
			}if(trueSource?.highImpedance){
				context.strokeStyle = blendColors(color, DEFAULT_HIGH_IMPEDANCE_COLOR);
			}
			if(wire.error){
				context.strokeStyle = DARK_RED;
			}
			
			drawLine(wire.linearLine, context, line_width, cameraOffset);
			drawLine(wire.diagonalLine, context, line_width, cameraOffset);
		});
	}

	useEffect(() => {
		/**
		 * If the wires have changed, but the positions of the wires haven't, then don't redraw
		 */
		if(wires !== prevWires.current && areWirePositionsEqual){
			return;
		} 
		/**
		 * If the binaryIO have changed, but the sources haven't, then don't redraw
		 */
		if(prevBinaryIO.current !== binaryIO && areWireSourcesEqual){
			return;
		}
		animationFrame.current = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(animationFrame.current);
		}
	}, [hoveringOverWire, areWireSourcesEqual, areWirePositionsEqual, cameraOffset, wires, binaryIO, canvasHeight, canvasWidth]);

	useEffect(() => {
		if(!canvasRef.current) return;
		canvasRef.current.height = canvasHeight;
		canvasRef.current.width = canvasWidth;
	}, [canvasHeight, canvasWidth]);
	return canvasRef;

}