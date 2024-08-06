import React, { useEffect, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { Wire } from '../Interfaces/Wire';
import { current } from '@reduxjs/toolkit';
import isWireConnectedToWire from '../utils/isWireConnectedToWire';
import { raiseShortCircuitError, setConnections } from '../state/slices/entities';
import { BinaryIO } from '../Interfaces/BinaryIO';
import checkLineEquality from '../utils/checkLineEquality';
import { setError } from '../state/slices/clock';


class ShortCircuitError extends Error{
	wireTree: string[];
	constructor(wireTree: string[]) {
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
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId});
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

		const connections: {wireTree: string[], outputs: string[], sourceId: string|null}[] = [];
		allWireTrees.forEach(tree => {
			const {outputs, sourceId, error} = getConnections(tree);
			if(error){
				return;
			}
			connections.push({wireTree: tree, outputs: outputs, sourceId: sourceId});
		});

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
 	* Get the IDs of the inputs and outputs that are connected to the wire tree.
 	* 
 	* This function traverses the given wire tree, checks if the inputs/outputs are on the wire tree,
 	* and determines the source ID. It handles short circuit errors by checking for multiple sources.
 	* 
 	* @param {string[]} wireTree - An array of wire IDs representing the wire tree.
 	* @returns {{outputs: string[], sourceId: string | null, error?: boolean}} 
 	* - An object containing:
 	*    - `outputs`: An array of output IDs connected to the wire tree.
 	*    - `sourceId`: The ID of the source input if one is found, otherwise null.
 	*    - `error`: A boolean flag indicating if a short circuit error occurred.
 	*/
	function getConnections(wireTree: string[]):{outputs:string[], sourceId: string|null, error?: boolean,
    }{
		const outputs:string[] = [];
		let sourceId: string|null = null;
		try{
			wireTree.forEach(wireId => {
				const wire = wires[wireId];
				Object.entries(io).forEach(([key, io]) => {
					const isOnIo = 
                    (wire.linearLine.startX === io.position?.x && wire.linearLine.startY === io.position?.y) ||
                    (wire.diagonalLine.endX === io.position?.x && wire.diagonalLine.endY === io.position?.y);
    
					if(isOnIo){
						if(
							(io.type === 'input' && !io.gateId) 
							|| (io.type === 'output' && io.gateId)
							|| (io.type === 'input' && io.gateId && io.gateId === currentComponentId)
						){
							if(sourceId && sourceId !== key){ 
								console.warn(`Short circuit! ${sourceId.slice(0,5)} -> ${key.slice(0,5)}`);
								throw new ShortCircuitError(wireTree);
							}
							sourceId = key;
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
			return {outputs: [], sourceId: null, error: true};
		}
        
		return {outputs, sourceId};
	}
}
