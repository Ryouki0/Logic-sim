import React, { useEffect, useRef } from 'react';
import * as pixi from 'pixi.js';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { checkWireSourceEquality } from '../../hooks/useRedrawCanvas';
import { LINE_WIDTH } from '../../Constants/defaultDimensions';
import { DARK_RED, DEFAULT_HIGH_IMPEDANCE_COLOR, DEFAULT_WIRE_COLOR } from '../../Constants/colors';
import { stat } from 'fs';
import { adjustBrightness } from '../../utils/adjustBrightness';
export default function PixiCanvas() {
	const canvasRef = useRef<HTMLDivElement | null>(null);
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth;});
	const canvasHeight = useSelector((state: RootState) => {return state.misc.canvasHeight;});
	const pixiRef = useRef<pixi.Application<pixi.ICanvas> | null>(null);
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const wires = useSelector((state: RootState) => { return state.entities.currentComponent.wires;});
	const lineWidth = useSelector((state: RootState) => {return state.misc.lineWidth;});
	const hoveringOverWire = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverWire;});


	/**
     * Create a hashmap with the wire ID as a key, and a list of binaryIO as value 
     */
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

	/**
     * Initialize the pixi canvas
     */
	useEffect(() => {
		const pixiApp = new pixi.Application({
			width: canvasWidth,
			height: canvasHeight,
		});

		canvasRef.current?.appendChild(pixiApp.view as HTMLCanvasElement);
		pixiRef.current = pixiApp;
		return () => {
			pixiApp.destroy(true, {children: true});
		};
	}, [canvasWidth, canvasHeight]);

	useEffect(() => {
		if(!pixiRef.current) return;
		const app = pixiRef.current;
		const graphics = app.stage.children[0] as pixi.Graphics || new pixi.Graphics();
		graphics.clear();
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

      
		graphics.lineStyle(lineWidth, DEFAULT_WIRE_COLOR);
		console.time('drawing');
		Object.entries(wires).forEach(([key, wire]) => {

			const trueSource = findTrueSource(key);
			const color = trueSource?.wireColor ?? (wire.color ?? DEFAULT_WIRE_COLOR);
			graphics.lineStyle(lineWidth, color);
			if(hoveringOverWire?.id === wire.id){
				graphics.lineStyle(lineWidth + (lineWidth * 0.25), color);
			}if(trueSource?.state){
				graphics.lineStyle(lineWidth, adjustBrightness(color, 20));//'rgb(255 200 0)';
			}if(trueSource?.highImpedance){
				graphics.lineStyle(lineWidth, DEFAULT_HIGH_IMPEDANCE_COLOR);
			}
			if(wire.error){
				graphics.lineStyle(lineWidth, DARK_RED);
			}

			graphics.moveTo(wire.linearLine.startX, wire.linearLine.startY);
			graphics.lineTo(wire.linearLine.endX, wire.linearLine.endY);

			graphics.moveTo(wire.diagonalLine.startX, wire.diagonalLine.startY);
			graphics.lineTo(wire.diagonalLine.endX, wire.diagonalLine.endY);
		});
		app.stage.addChild(graphics as pixi.DisplayObject);
		console.timeEnd('drawing');
	}, [wires, hoveringOverWire, wireSources, canvasHeight, canvasWidth, cameraOffset]);

	return <div ref={canvasRef}>

	</div>;
}