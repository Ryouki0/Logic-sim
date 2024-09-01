import React, { useEffect, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { Wire } from '@Shared/interfaces';
import { current } from '@reduxjs/toolkit';
import isWireConnectedToWire from '../utils/Spatial/isWireConnectedToWire';
import { raiseShortCircuitError, setConnections } from '../state/slices/entities';
import { BinaryIO } from '../Interfaces/BinaryIO';
import checkLineEquality from '../utils/checkLineEquality';
import { setError } from '../state/slices/clock';
import isOnIo from '../utils/Spatial/isOnIo';


export class ShortCircuitError extends Error{
	wireTree: string[] | null;
	constructor(wireTree: string[] | null) {
		super("Short circuit");
		this.name = "Short circuit";
		this.wireTree = wireTree;
		Object.setPrototypeOf(this, ShortCircuitError.prototype);
	}
}

const checkWireEquality = (prev: {[key: string]: Wire}, next:{[key: string]:Wire}) => {
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


export default function useConnecting(){
	const wires = useSelector((state: RootState) => {return state.entities.currentComponent.wires;}, checkWireEquality);
	const io = useSelector((state: RootState) => {
		return state.entities.currentComponent.binaryIO;
	}, checkIOEquality);
	const drawingWire = useSelector((state: RootState) => {return state.mouseEventsSlice.drawingWire;});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const dispatch = useDispatch();
	useEffect(() => {
		if(drawingWire) return;
		const wireEntries = Object.entries(wires);
		const allWireTrees: string[][] = [];
		dispatch(setError({isError: false, extraInfo: ''}));
		for(const [key, wire] of wireEntries){
			let wireInTree = false;
			allWireTrees.forEach(tree => {
				if(tree.includes(key)){
					wireInTree = true;
				}
			});
			if(wireInTree){
				continue;
			}
			allWireTrees.push(buildWireTree(key));
		}

		const connections: {wireTree: string[], outputs: string[], sourceIds: string[]|null}[] = [];
		allWireTrees.forEach(tree => {
			const {outputs, sourceIds, error} = getConnections(tree);
			if(error){
				return;
			}
			connections.push({wireTree: tree, outputs: outputs, sourceIds: sourceIds});
		});

		// connections.forEach((connection, idx) => {
		// 	console.log(`\n${idx}-Connection:\n`);
		// 	console.log(`OUTPUTS:`);
		// 	connection.outputs.forEach((outputId,idx) => {
		// 		console.log(`${idx}--${outputId.slice(0,6)}`);
		// 	})

		// 	console.log(`source ID: ${connection.sourceId?.slice(0,6)}`);

		// 	console.log(`wires: `);
		// 	connection.wireTree.forEach((wire,idx) => {
		// 		console.log(`${idx}--${wire.slice(0,6)}`);
		// 	})
		// })

		dispatch(setConnections({connections: connections, componentId: currentComponentId}));
	}, [wires,io, drawingWire, currentComponentId]);


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
				if(isWireConnectedToWire(wire, currentWire)){
					nextWires.push(key);
				}else if(isWireConnectedToWire(currentWire, wire)){
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
					(isOnIo(wire.linearLine.startX, wire.linearLine.startY, ioEntry)) ||
					(isOnIo(wire.diagonalLine.endX, wire.diagonalLine.endY, ioEntry));
					
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
