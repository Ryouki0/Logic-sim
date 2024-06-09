import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../state/store';
import { DEFAULT_GATE_DIM, DEFAULT_INPUT_DIM } from '../Constants/defaultDimensions';
import { calculateInputTop } from '../utils/calculateInputTop';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';
import { Wire } from '../Interfaces/Wire';
import { addWireToGateInput, connectToGlobalOutput, connectWireToWire, disconnectWireFromGate, disconnectWireFromGlobalOutput, } from '../state/slices/entities';
import { Gate } from '../Interfaces/Gate';
import checkLineEquality from '../utils/checkLineEquality';
import { connect } from 'http2';
import { isAction } from 'redux';
import { Root } from 'react-dom/client';
import disconnectByWire from '../utils/disconnectByWire';
import useIsWireClicked from './useIsWireClicked';

const checkGatePositionEquality = (prev: {[key: string]:Gate}, next: {[key: string]:Gate}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries.length !== nextEntries.length){
		return false;
	}
	for (const [key, gate] of prevEntries){
		const nextGate = next[key];
		if(nextGate.position?.x !== gate.position?.x || nextGate.position?.y !== gate.position?.y){
			//console.log(`gate should render`);
			return false;
		}
	}
	return true;
};

const checkWirePositionEquality = (prev: {[key:string]:Wire}, next: {[key:string]:Wire}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
    
	if (prevEntries.length !== nextEntries.length) {
		return false;
	}

	for (const [key, prevWire] of prevEntries) {
		const nextWire = next[key];
		if (!nextWire) {
			return false;
		}
		if (!checkLineEquality(prevWire.linearLine, nextWire.linearLine)) {
			return false;
		}
		if (!checkLineEquality(prevWire.diagonalLine, nextWire.diagonalLine)) {
			return false;
		}
		if(nextWire.connectedToId.length !== prevWire.connectedToId.length){
			return false;
		}
	}

	return true;
};

export default function useConnecting(){
	const gates = useSelector((state: RootState) => {return state.entities.gates;}, checkGatePositionEquality);
	const wires = useSelector((state: RootState) => {return state.entities.wires;}, checkWirePositionEquality);
	const globalOutputs = useSelector((state:RootState) => {return state.entities.globalOutputs;});
	const dispatch = useDispatch();
    
	//Disconnecting needs to happen first, to not get short circuit error when moving the gate directly from wire to wire
	useEffect(() => {
		const allConnections:{ ioId: string, gate: Gate | null, action: 'connected' | 'disconnected' | null, wire: Wire }[] = [];
		Object.entries(wires).forEach(([key, w]) => {
             
			const connections = checkConnections(w.linearLine.endX, w.linearLine.endY, w.diagonalLine.endX, w.diagonalLine.endY, w);
			connections?.forEach(connection => {
				allConnections.push({...connection, wire:w});
			});
		});

		allConnections.forEach(connection => {
			if(connection.action === 'disconnected'){
				if(!connection.gate){
					dispatch(disconnectWireFromGlobalOutput({wireId: connection.wire.id, outputId: connection.ioId, }));
				}else{
					console.log(`disconnecting: ${connection.ioId.slice(0,5)}`);
					dispatch(disconnectWireFromGate({gateId: connection.gate.id, inputId: connection.ioId, wireId: connection.wire.id}));
				}
			}
		});
        
		allConnections.forEach(connection => {
			if(connection.action === 'connected'){
				if(!connection.gate){
					console.log(`connect: ${connection.ioId.slice(0,5)}`);
					dispatch(connectToGlobalOutput({
						outputId: connection.ioId, 
						wireId: connection.wire.id}));
				}else{
					dispatch(addWireToGateInput({gate: connection.gate, inputId: connection.ioId, wire: connection.wire}));
				}
			}            
		});
	}, [gates, wires]);
        

	const checkConnections = (x:number,y:number, x2:number, y2:number, wire: Wire) => {
		const connections: { ioId: string, gate: Gate | null, action: 'connected' | 'disconnected' | null }[] = [];
        
		//Check the gates' inputs
		Object.entries(gates).forEach(([key, g]) => {
			const inputs = Object.entries(g.inputs);
			const inputConnections = inputs.map(([key, input], idx, array) => {
				let roundedY =0;
				if(g.position?.y){
					roundedY = g.position.y + calculateInputTop(idx, array.length) + (DEFAULT_INPUT_DIM.height/2) + (idx*DEFAULT_INPUT_DIM.height);
				}else{
					return;
				}
                
				let isConnected = false;

				wire.connectedToId?.forEach(connectedioId => {
					if(connectedioId.id === input.id){
						isConnected =true;
					}});
				if ((roundedY === y && x === g.position?.x) || (roundedY === y2 && x2 === g.position?.x)) {
					if(isConnected){
						return null;
					}
					return { ioId: input.id, gate: g, action: 'connected' };
 
				} else if (isConnected) {
					return { ioId: input.id, gate: g, action: 'disconnected' };
				} 
				else {
					return null;
				}
			}).filter(connection => connection !== null) as { ioId: string, gate: Gate, action: 'connected' | 'disconnected' | null }[];
    
			connections.push(...inputConnections);
		});

		//check global outputs
		const globalOutputEntries = Object.entries(globalOutputs);
		for(const [key, output] of globalOutputEntries){
			if(output.position){
				let isConnected = false;
				wire.connectedToId?.forEach(to => {
					if(to.id === key){
						isConnected =true;
					}
				});
            
				if((output.position.x === x && output.position.y === y) || (output.position.x === x2 && output.position.y === y2)){
					if(isConnected){
						return null;
					}else{
						connections.push({action: 'connected', gate:null,ioId:key});
					}
				}else if(isConnected){
					console.log(`needs to disconnect... ${key.slice(0,5)}`);
					connections.push({ioId: key, action: 'disconnected', gate: null});
				}
			}
		}

        
		return connections;
	};
    
	return null;
}