import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { Wire } from '../Interfaces/Wire';
import { current } from '@reduxjs/toolkit';
import isWireConnectedToWire from '../utils/isWireConnectedToWire';
import { setConnections } from '../state/slices/entities';
import { BinaryIO } from '../Interfaces/BinaryIO';
import checkLineEquality from '../utils/checkLineEquality';
//Only trigger re-render when the drawingWire is null, so that the wire won't connect when drawing
const checkDrawingWireEquality = (prev:string|null,next:string|null) => {
    if(prev && !next){
        return false;
    }else{
        return true;
    }
}
const checkWireEquality = (prev: {[key: string]: Wire}, next:{[key: string]:Wire}) => {
    const prevEntries = Object.entries(prev);
    if(Object.entries(next).length !== prevEntries?.length){
        return false;
    }
    for(const [key, wire] of prevEntries){
        if(!(checkLineEquality(wire.linearLine, next[key]?.linearLine)) 
        || !(checkLineEquality(wire.diagonalLine, next[key]?.diagonalLine))){
            return false;
        }
    }
    return true;
}
const checkIOEquality = (prev: {[key: string]: BinaryIO}, next: {[key: string]: BinaryIO}) => {
    let isEqual = true;
    const prevEntries = Object.entries(prev);
    const nextEntries = Object.entries(next);
    if(prevEntries?.length !== nextEntries?.length){
        return false;
    }
    for(const [key, io] of prevEntries){
        const nextIo = next[key];
        if(io.position?.x !== nextIo.position?.x || io.position?.y !== nextIo.position?.y){
            return false;
        }
    }
    return isEqual
}


export default function useConnecting(){
    const wires = useSelector((state: RootState) => {return state.entities.currentComponent.wires}, checkWireEquality);
    const io = useSelector((state: RootState) => {
        return state.entities.currentComponent.binaryIO;
    }, checkIOEquality)
    const drawingWire = useSelector((state: RootState) => {return state.mouseEventsSlice.drawingWire}, checkDrawingWireEquality);
    const dispatch = useDispatch();
    
    useEffect(() => {
        const ioEntries = Object.entries(io);
        const wireEntries = Object.entries(wires);
        const allWireTrees: string[][] = [];

        for(const [key, wire] of wireEntries){
            let wireInTree = false;
            allWireTrees.forEach(tree => {
                if(tree.includes(key)){
                    wireInTree = true;
                }
            })
            if(wireInTree){
                continue;
            }
            allWireTrees.push(buildWireTree(key))
        }

        const connections: {wireTree: string[], outputs: string[], sourceId: string|null}[] = [];
        allWireTrees.forEach(tree => {
            const {outputs, sourceId} = getConnections(tree);
            connections.push({wireTree: tree, outputs: outputs, sourceId: sourceId});
        })
        dispatch(setConnections({connections: connections}));
    }, [wires,io, drawingWire])


    /**
     * Gives back a list of wire IDs that are connected to the given wire
     * @param {string} wireId A random wire that is not in any wire tree yet
     * @returns {string[]}  The wire tree
     */
    function buildWireTree(wireId: string): string[] {
        let nextWires:string[] = [wireId];
        let wireTree: string[] = [];
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
            })
        }
        
        return wireTree;
    }

    /**
     * Get the IDs of the inputs and outputs that are connected to the wire tree.
     * @param wireTree The wire tree
     * @returns {string[]} The IDs of the IOs that are connected to the tree.
     */
    function getConnections(wireTree: string[]):{outputs:string[], sourceId: string|null}{
        const outputs:string[] = [];
        let sourceId: string|null = null;
        wireTree.forEach(wireId => {
            const wire = wires[wireId];
            Object.entries(io).forEach(([key, io]) => {
                const isOnIo = 
                (wire.linearLine.startX === io.position?.x && wire.linearLine.startY === io.position?.y) ||
                (wire.diagonalLine.endX === io.position?.x && wire.diagonalLine.endY === io.position?.y);

                if(isOnIo){
                    if((io.type === 'input' && !io.gateId) || (io.type === 'output' && io.gateId)){
                        if(sourceId && sourceId !== key){   
                            console.warn(`Short circuit! ${sourceId.slice(0,5)} -> ${key.slice(0,5)}`);
                        }
                        sourceId = key;
                        return;
                    }
                    outputs.push(key);
                }
            })
        })
        return {outputs, sourceId};
    }
}








// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from '../state/store';
// import { DEFAULT_GATE_DIM, DEFAULT_INPUT_DIM } from '../Constants/defaultDimensions';
// import { calculateInputTop } from '../utils/calculateInputTop';
// import { getClosestBlock } from '../Constants/defaultDimensions';
// import { Wire } from '../Interfaces/Wire';
// import { Gate } from '../Interfaces/Gate';
// import checkLineEquality from '../utils/checkLineEquality';
// import { connect } from 'http2';
// import { isAction } from 'redux';
// import { Root } from 'react-dom/client';
// import useIsWireClicked from './useIsWireClicked';

// const checkGatePositionEquality = (prev: {[key: string]:Gate}, next: {[key: string]:Gate}) => {
// 	const prevEntries = Object.entries(prev);
// 	const nextEntries = Object.entries(next);
// 	if(prevEntries.length !== nextEntries.length){
// 		return false;
// 	}
// 	for (const [key, gate] of prevEntries){
// 		const nextGate = next[key];
// 		if(nextGate.position?.x !== gate.position?.x || nextGate.position?.y !== gate.position?.y){
// 			//console.log(`gate should render`);
// 			return false;
// 		}
// 	}
// 	return true;
// };

// const checkWirePositionEquality = (prev: {[key:string]:Wire}, next: {[key:string]:Wire}) => {
// 	const prevEntries = Object.entries(prev);
// 	const nextEntries = Object.entries(next);
    
// 	if (prevEntries.length !== nextEntries.length) {
// 		return false;
// 	}

// 	for (const [key, prevWire] of prevEntries) {
// 		const nextWire = next[key];
// 		if (!nextWire) {
// 			return false;
// 		}
// 		if (!checkLineEquality(prevWire.linearLine, nextWire.linearLine)) {
// 			return false;
// 		}
// 		if (!checkLineEquality(prevWire.diagonalLine, nextWire.diagonalLine)) {
// 			return false;
// 		}
// 		if(nextWire.connectedToId.length !== prevWire.connectedToId.length){
// 			return false;
// 		}
// 	}

// 	return true;
// };

// export default function useConnecting(){
// 	const gates = useSelector((state: RootState) => {return state.entities.gates;}, checkGatePositionEquality);
// 	const wires = useSelector((state: RootState) => {return state.entities.wires;}, checkWirePositionEquality);
// 	const globalOutputs = useSelector((state:RootState) => {
// 		return
// 	});
// 	const dispatch = useDispatch();
    
// 	//Disconnecting needs to happen first, to not get short circuit error when moving the gate directly from wire to wire
// 	useEffect(() => {
// 		const allConnections:{ ioId: string, gate: Gate | null, action: 'connected' | 'disconnected' | null, wire: Wire }[] = [];
// 		Object.entries(wires).forEach(([key, w]) => {
             
// 			const connections = checkConnections(w.linearLine.endX, w.linearLine.endY, w.diagonalLine.endX, w.diagonalLine.endY, w);
// 			connections?.forEach(connection => {
// 				allConnections.push({...connection, wire:w});
// 			});
// 		});

// 		allConnections.forEach(connection => {
// 			if(connection.action === 'disconnected'){
// 				if(!connection.gate){
// 					dispatch(disconnectWireFromGlobalOutput({wireId: connection.wire.id, outputId: connection.ioId, }));
// 				}else{
// 					console.log(`disconnecting: ${connection.ioId.slice(0,5)}`);
// 					dispatch(disconnectWireFromGate({gateId: connection.gate.id, inputId: connection.ioId, wireId: connection.wire.id}));
// 				}
// 			}
// 		});
        
// 		allConnections.forEach(connection => {
// 			if(connection.action === 'connected'){
// 				if(!connection.gate){
// 					console.log(`connect: ${connection.ioId.slice(0,5)}`);
// 					dispatch(connectToGlobalOutput({
// 						outputId: connection.ioId, 
// 						wireId: connection.wire.id}));
// 				}else{
// 					dispatch(addWireToGateInput({gate: connection.gate, inputId: connection.ioId, wire: connection.wire}));
// 				}
// 			}            
// 		});
// 	}, [gates, wires]);
        

// 	const checkConnections = (x:number,y:number, x2:number, y2:number, wire: Wire) => {
// 		const connections: { ioId: string, gate: Gate | null, action: 'connected' | 'disconnected' | null }[] = [];
        
// 		//Check the gates' inputs
// 		Object.entries(gates).forEach(([key, g]) => {
// 			const inputs = Object.entries(g.inputs);
// 			const inputConnections = inputs.map(([key, input], idx, array) => {
// 				let roundedY =0;
// 				if(g.position?.y){
// 					roundedY = g.position.y + calculateInputTop(idx, array.length) + (DEFAULT_INPUT_DIM.height/2) + (idx*DEFAULT_INPUT_DIM.height);
// 				}else{
// 					return;
// 				}
                
// 				let isConnected = false;

// 				wire.connectedToId?.forEach(connectedioId => {
// 					if(connectedioId.id === input.id){
// 						isConnected =true;
// 					}});
// 				if ((roundedY === y && x === g.position?.x) || (roundedY === y2 && x2 === g.position?.x)) {
// 					if(isConnected){
// 						return null;
// 					}
// 					return { ioId: input.id, gate: g, action: 'connected' };
 
// 				} else if (isConnected) {
// 					return { ioId: input.id, gate: g, action: 'disconnected' };
// 				} 
// 				else {
// 					return null;
// 				}
// 			}).filter(connection => connection !== null) as { ioId: string, gate: Gate, action: 'connected' | 'disconnected' | null }[];
    
// 			connections.push(...inputConnections);
// 		});

// 		//check global outputs
// 		const globalOutputEntries = Object.entries(globalOutputs);
// 		for(const [key, output] of globalOutputEntries){
// 			if(output.position){
// 				let isConnected = false;
// 				wire.connectedToId?.forEach(to => {
// 					if(to.id === key){
// 						isConnected =true;
// 					}
// 				});
            
// 				if((output.position.x === x && output.position.y === y) || (output.position.x === x2 && output.position.y === y2)){
// 					if(isConnected){
// 						return null;
// 					}else{
// 						connections.push({action: 'connected', gate:null,ioId:key});
// 					}
// 				}else if(isConnected){
// 					console.log(`needs to disconnect... ${key.slice(0,5)}`);
// 					connections.push({ioId: key, action: 'disconnected', gate: null});
// 				}
// 			}
// 		}

        
// 		return connections;
// 	};
    
// 	return null;
// }