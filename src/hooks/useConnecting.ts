import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../state/store';
import { DEFAULT_GATE_DIM, DEFAULT_INPUT_DIM } from '../Constants/defaultDimensions';
import { calculateInputTop } from '../utils/calculateInputTop';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';
import { Wire } from '../Interfaces/Wire';
import { addWireToGateInput, disconnectWireFromGate, } from '../state/objectsSlice';
import { Gate } from '../Interfaces/Gate';
import checkLineEquality from '../utils/checkLineEquality';
import { connect } from 'http2';

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
}

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
        if(nextWire.connectedToId !== prevWire.connectedToId){
            return false
        }
    }

    return true;
}

export default function useConnecting(){
    const gates = useSelector((state: RootState) => {return state.objectsSlice.gates}, checkGatePositionEquality);
    const wires = useSelector((state: RootState) => {return state.objectsSlice.wires}, checkWirePositionEquality);
    const dispatch = useDispatch();
    
    useEffect(() => {
        console.log('change');
        Object.entries(wires).forEach(([key, w]) => {
             
            const connections = checkRectInputs(w.linearLine.endX, w.linearLine.endY, w.diagonalLine.endX, w.diagonalLine.endY, w);
            
            connections.forEach(connection => {
                //console.log(`${connection.action} ${connection.gate.id}`);

                if(connection.action === 'connected'){
                    dispatch(addWireToGateInput({gate:connection.gate, inputId: connection.inputId, wire: w}));

                }else if(connection.action === 'disconnected'){
                    dispatch(disconnectWireFromGate({gateId:connection.gate.id, inputId: connection.inputId, wireId: w.id}));
                }
            })
        }
    )}, [gates, wires])

    const checkRectInputs = (x:number,y:number, x2:number, y2:number, wire: Wire) => {
        const connections: { inputId: string, gate: Gate, action: 'connected' | 'disconnected' | null }[] = [];

        Object.entries(gates).forEach(([key, g]) => {
			const inputs = Object.entries(g.inputs);
            const inputConnections = inputs.map(([key, input], idx, array) => {

                const inputY = calculateInputTop(idx, array.length);
                const { roundedX, roundedY } = getClosestBlock(g.position?.x ?? 0, g.position?.y ? g.position.y + inputY + DEFAULT_INPUT_DIM.height : 0);
                
                let isConnected = false;

                wire.connectedToId?.forEach(connectedInputId => {
                    if(connectedInputId.id === input.id){
                        isConnected =true;
                }})
                if ((roundedY === y && x === g.position?.x) || (roundedY === y2 && x2 === g.position?.x)) {
                    if(isConnected){
                        return null;
                    }
                    return { inputId: input.id, gate: g, action: 'connected' };
 
                } else if (isConnected) {
                    return { inputId: input.id, gate: g, action: 'disconnected' };
                } 
                else {
                    return null;
                }
            }).filter(connection => connection !== null) as { inputId: string, gate: Gate, action: 'connected' | 'disconnected' | null }[];
    
            connections.push(...inputConnections);
        });
    
        return connections;
    }
    
    return null;
}