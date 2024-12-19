import React, { useEffect, useMemo, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { Wire } from '@Shared/interfaces';
import { current, isAction } from '@reduxjs/toolkit';
import isWireConnectedToWire from '../utils/Spatial/isWireConnectedToWire';
import { raiseShortCircuitError, setConnections } from '../state/slices/entities';
import { BinaryIO } from '../Interfaces/BinaryIO';
import checkLineEquality from '../utils/checkLineEquality';
import { setError } from '../state/slices/clock';
import isOnIo from '../utils/Spatial/isOnIo';
import { connectingWorkerEvent } from '../workers/connecting.worker';
import { transpileModule } from 'typescript';


export class ShortCircuitError extends Error{
	wireTree: string[] | null;
	constructor(wireTree: string[] | null) {
		super("Short circuit");
		this.name = "Short circuit";
		this.wireTree = wireTree;
		Object.setPrototypeOf(this, ShortCircuitError.prototype);
	}
}
/**
 * Checks if the positions of the wires have changed
 * @param prev The previous wire state
 * @param next The next wire state
 * @returns True if there is no change, false otherwise
 */
export const checkWireEquality = (prev: {[key: string]: Wire} | null, next:{[key: string]:Wire} | null) => {
	if(!prev || !next) return false;
	const prevEntries = Object.entries(prev);
	if(Object.entries(next).length !== prevEntries?.length){
		return false;
	}
	for(const [key, wire] of prevEntries){
		if(!(checkLineEquality(wire.linearLine, next[key]?.linearLine)) 
        || !(checkLineEquality(wire.diagonalLine, next[key]?.diagonalLine)) 
		|| (wire && !next[key])){
			return false;
		}
		if(wire.color !== next[key].color) {
			return false;
		}
	}
	return true;
};
const checkIOEquality = (prev: {[key: string]: BinaryIO}, next: {[key: string]: BinaryIO}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries?.length !== nextEntries?.length){
		return false;
	}
	for(const [key, io] of prevEntries){
		const nextIo = next[key];
		if(!nextIo){
			return false;
		}
		if(io.position?.x !== nextIo?.position?.x || io.position?.y !== nextIo?.position?.y){
			return false;
		}
	}
	return true;
};

const checkIOPositions = (prev: {[key: string]: BinaryIO} | null, next: {[key: string]: BinaryIO} | null) => {
	if(!prev || !next){
		return true;
	}
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries.length !== nextEntries.length){
		return false;
	}

	for(const [key, io] of prevEntries){
		if(io.position?.x !== next[key].position?.x || io.position?.y !== next[key].position?.y){
			return false;
		}
	}
	return true;
}

export default function useConnecting(){
	const wires = useSelector((state: RootState) => {return state.entities.currentComponent.wires;}, shallowEqual);
	const io = useSelector((state: RootState) => {
		return state.entities.currentComponent.binaryIO;
	}, checkIOEquality);
	const drawingWire = useSelector((state: RootState) => {return state.mouseEventsSlice.drawingWire;});
	const draggingGate = useSelector((state: RootState) => {return state.mouseEventsSlice.draggingGate;});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});
	const lineWidth = useSelector((state: RootState) => {return state.misc.lineWidth;});
	
	const prevWires = useRef<{[key: string]: Wire} | null>(null);
	const currentWires = useRef<{[key: string]: Wire} | null>(null);
	
	const prevDrawingWire = useRef<string | null>();
	const currentDrawingWire = useRef<string | null>();
	
	const prevIo = useRef<{[key: string]: BinaryIO} | null>(null);
	const currentIo = useRef<{[key: string]: BinaryIO} | null>(null);
	
	const importedWorkerRef = useRef<any>();
	const workerRef = useRef<any>();

	const [areWiresEqual, setAreWiresEqual] = useState<boolean>(false);
	const [areIOsEqual, setAreIOsEqual] = useState(false); 
	const dispatch = useDispatch();

	/**
	 * `draggingGate` shouldn't be a dependency because 
	 */
	useEffect(() => {
		prevWires.current = currentWires.current;
		currentWires.current = wires;

		prevDrawingWire.current = currentDrawingWire.current;
		currentDrawingWire.current = drawingWire;

		prevIo.current = currentIo.current;
		currentIo.current = io;
	}, [io, drawingWire, currentComponentId, wires]);

	
	
	useEffect(() => {
		const connectingWorker = require('../workers/connecting.worker.ts').default;
		importedWorkerRef.current = connectingWorker;
	}, []);

	useEffect(() => {
		const areWiresEqual = checkWireEquality(prevWires.current, wires);
		setAreWiresEqual(areWiresEqual)
	}, [wires]);

	useEffect(() => {
		const areIOsEqual = checkIOPositions(prevIo.current, io);
		setAreIOsEqual(areIOsEqual);
	}, [io])

	useEffect(() => {
		let shouldRebuild = false;
		if((draggingGate || drawingWire)) {
			return;
		};

		/**
		 * If drawingWire changed, but the wires haven't, don't check
		 */
		if((prevDrawingWire.current !== currentDrawingWire.current && !areWiresEqual)) {
			shouldRebuild = true;
		};

		/**
		 * If the wires changed, but their positions are the same, don't check
		 */
		if((prevWires.current !== wires && !areWiresEqual)) {
			shouldRebuild = true;
		};

		if((prevIo.current !== io && !areIOsEqual)){
			shouldRebuild = true;
		}
		if(shouldRebuild){
			workerRef.current = new importedWorkerRef.current();
			workerRef.current.postMessage({
				wires: wires,
				io: io,
				lineWidth: lineWidth,
				cameraOffset: cameraOffset,
				ioRadius: ioRadius,
				currentComponentId: currentComponentId,
				action: 'check',
			});
			workerRef.current.onmessage = (event: MessageEvent<connectingWorkerEvent>) => {
				const connections = event.data.connections;
				if(event.data.error?.isError){
					dispatch(raiseShortCircuitError({wireTree: event.data.error!.wireTree}));
					dispatch(setError({isError: true, extraInfo: 'Short circuit!'}));
				}
				else {
					dispatch(setError({isError: false, extraInfo: ''}));
					dispatch(setConnections({connections: connections, componentId: currentComponentId}));
				}
			};
		}
		
		
		return () => {
			workerRef.current?.terminate();
		};
	}, [io, drawingWire, currentComponentId, draggingGate, wires, areIOsEqual, areWiresEqual]);


	useEffect(() => {
		// console.log('\ndraggingGate changed', draggingGate);
	}, [draggingGate]);

	useEffect(() => {
		// console.log(`drawing wire changed ${drawingWire ? 'true' : 'false'}`);
	}, [drawingWire]);

	/**
     * Gives back a list of wire IDs that are connected to the given wire
     * @param {string} wireId A random wire that is not in any wire tree yet
     * @returns {string[]}  The wire tree
     */
	function buildWireTree(wireId: string): string[] {
		const nextWires:string[] = [wireId];
		const wireTree: string[] = [];
		while(nextWires.length >0){
			const currentWireId = nextWires.pop();
			if(!currentWireId){
				throw new Error(`When building wire tree, there is no currentWire!: ${currentWireId}`);
			}
			const currentWire = wires[currentWireId];
			
			wireTree.push(currentWireId);
			Object.entries(wires).forEach(([key, wire]) => {
				if(key === currentWireId){
					return;
				}
				if(wireTree.includes(key)){
					return;
				}
				if(isWireConnectedToWire(wire, currentWire, lineWidth)){
					nextWires.push(key);
				}else if(isWireConnectedToWire(currentWire, wire, lineWidth)){
					nextWires.push(key);
				}
			});
		}
        
		return wireTree;
	}

	/**
	 * Traverses the wire tree and gets the I/Os on the endpoints of the wires
	 * @param wireTree The wire tree
	 * @throws ShortCircuitError if there are two or more sources of the wire tree, that are not in high impedance state
	 * @returns An object containing the sources and outputs
	 */
	function getConnections(wireTree: string[]):{outputs:string[], sourceIds: string[]|null, error?: boolean,
    }{
		const outputs:string[] = [];
		const sourceIds: string[]|null = [];
		try{
			wireTree.forEach(wireId => {
				const wire = wires[wireId];
				Object.entries(io).forEach(([key, ioEntry]) => {
					const isOnWire = 
					(isOnIo(wire.linearLine.startX + cameraOffset.x, wire.linearLine.startY + cameraOffset.y, ioEntry, cameraOffset, ioRadius)) ||
					(isOnIo(wire.diagonalLine.endX + cameraOffset.x, wire.diagonalLine.endY + cameraOffset.y, ioEntry, cameraOffset, ioRadius));
					
					if(isOnWire){
						if(
							(ioEntry.type === 'input' && !ioEntry.gateId) 
							|| (ioEntry.type === 'output' && ioEntry.gateId && ioEntry.gateId !== currentComponentId) 
							|| (ioEntry.type === 'input' && ioEntry.gateId && ioEntry.gateId === currentComponentId)
						){
							if(sourceIds!.includes(key)) return;
							sourceIds!.forEach(sourceId => {
								if(!io[sourceId].highImpedance && !ioEntry.highImpedance){
									console.warn(`Short circuit! ${sourceId.slice(0,5)} -> ${key.slice(0,5)}`);
									throw new ShortCircuitError(wireTree);
								}	
							}); 
								
							
							sourceIds!.push(key);
							return;
						}
						outputs.push(key);
					}
				});
			});
		}catch(err){
			if(err instanceof ShortCircuitError){
				dispatch(raiseShortCircuitError({wireTree: err.wireTree}));
				dispatch(setError({isError: true, extraInfo: 'Short circuit error! A wire has multiple sources.'}));
			}
			return {outputs: [], sourceIds: null, error: true};
		}
        
		return {outputs, sourceIds};
	}
}
