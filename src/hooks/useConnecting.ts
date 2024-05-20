import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../state/store';
import { DEFAULT_GATE_DIM, DEFAULT_INPUT_DIM } from '../Constants/defaultDimensions';
import { calculateInputTop } from '../utils/calculateInputTop';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';
import { Wire } from '../Interfaces/Wire';
import { addWireToGateInput, removeWireFromGateInput } from '../state/objectsSlice';
import { Gate } from '../Interfaces/Gate';
import checkLineEquality from '../utils/checkLineEquality';
import { connect } from 'http2';

const checkGatePositionEquality = (prev: Gate[], next: Gate[]) => {
    let isEqual = true;
    if(prev.length !== next.length){
        return false;
    }
    for(let i = 0;i<prev.length;i++){
        if(prev[i].position?.x !== next[i].position?.x || prev[i].position?.y !== next[i].position?.y){
            isEqual = false;
        }
    }
    return isEqual;
}

const checkWirePositionEquality = (prev: Wire[], next: Wire[]) => {
    if(prev.length !== next.length){
        return false;
    }
    for(let i =0;i<prev.length;i++){
        if(!checkLineEquality(prev[i].linearLine, next[i].linearLine)){
            return false;
        }
        if(!checkLineEquality(prev[i].diagonalLine, next[i].diagonalLine)){
            return false;
        }
        if(prev[i].connectedTo !== next[i].connectedTo){
            return false;
        }
    }
    return true;
}

export default function useConnecting(){
    const gates = useSelector((state: RootState) => {return state.objectsSlice.gates}, checkGatePositionEquality);
    const wires = useSelector((state: RootState) => {return state.objectsSlice.wires}, checkWirePositionEquality);
    const dispatch = useDispatch();
    
    useEffect(() => {

        wires.forEach(w => {
             
            const connections = checkRectInputs(w.linearLine.endX, w.linearLine.endY, w.diagonalLine.endX, w.diagonalLine.endY, w);
            
            connections.forEach(connection => {
                console.log(`${connection.action} ${connection.gate.id}`);

                if(connection.action === 'connected'){
                    dispatch(addWireToGateInput({gate: connection.gate, inputIdx: connection.inputIdx, wire:w}))

                }else if(connection.action === 'disconnected'){
                    console.log(`disconnect: ${connection.gate.id}`);
                    dispatch(removeWireFromGateInput({gate: connection.gate, inputIdx: connection.inputIdx, wire:w}))
                }
            })
        }
    )}, [gates, wires])

    const checkRectInputs = (x:number,y:number, x2:number, y2:number, wire: Wire) => {
        let inputIdx:number|null=null;
        let gate:Gate|null=null;
        let action: 'connected' | 'disconnected' | null =null;
        const connections: { inputIdx: number, gate: Gate, action: 'connected' | 'disconnected' | null }[] = [];

        gates.forEach(g => {
            const inputConnections = g.inputs.map((input, idx, array) => {

                const inputY = calculateInputTop(idx, array);
                const { roundedX, roundedY } = getClosestBlock(g.position?.x ?? 0, g.position?.y ? g.position.y + inputY + DEFAULT_INPUT_DIM.height : 0);
                
                let isConnected = false;

                wire.connectedTo?.forEach(connectedInput => {
                    console.log(`connectedInput ID: ${connectedInput.id}`);
                    if(connectedInput.id === input.id){
                        isConnected =true;
                }})
                //console.log(`wire is Connected? :${isConnected}`);
                //console.log(`wire positions:x: ${x} y: ${y}  || diagonal line: x ${x2} Y: ${y2}\nGate positions: y:${roundedY} ${g.position?.x}`);
                if ((roundedY === y && x === g.position?.x) || (roundedY === y2 && x2 === g.position?.x)) {
                    if(isConnected){
                        return null;
                    }
                    return { inputIdx: idx, gate: g, action: 'connected' };
 
                } else if (isConnected) {
                    console.log(`needs to disconnect...`);
                   return { inputIdx: idx, gate: g, action: 'disconnected' };
                } 
                else {
                    return null;
                }
            }).filter(connection => connection !== null) as { inputIdx: number, gate: Gate, action: 'connected' | 'disconnected' | null }[];
    
            connections.push(...inputConnections);
        });
    
        return connections;
    }
    
    return null;
}