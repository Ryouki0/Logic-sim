import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from '../state/store';
import { DEFAULT_GATE_DIM, DEFAULT_INPUT_DIM } from '../Constants/defaultDimensions';
import { calculateInputTop } from '../utils/calculateInputTop';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';
import { Wire } from '../Interfaces/Wire';
import { addWireToGateInput } from '../state/objectsSlice';
import { Gate } from '../Interfaces/Gate';

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

export default function useConnecting(){
    const gates = useSelector((state: RootState) => {return state.objectsSlice.gates}, checkGatePositionEquality);
    const wires = useSelector((state: RootState) => {return state.objectsSlice.wires});
    const dispatch = useDispatch();

    useEffect(() => {
        wires.forEach(w => {

            if(!(w.linearLine.endX === w.linearLine.startX && w.linearLine.startY === w.linearLine.endY)){
                checkRectInputs(w.linearLine.endX, w.linearLine.endY, w);
            }
            if(!(w.diagonalLine.endX === w.diagonalLine.startX && w.diagonalLine.startY === w.diagonalLine.endY)){
                checkRectInputs(w.diagonalLine.endX, w.diagonalLine.endY, w);
            }
        })

    }, [gates, wires])

    const checkRectInputs = (x:number,y:number, wire: Wire) => {
        //console.log('gates: ', gates.length);
        gates.forEach(g => {
            //console.log(`G.POS: x: ${g.position?.x} y: ${g.position?.y} \nPOINT: x: ${x} y: ${y}`);
            
            g.inputs.forEach((input, idx, array) => {
                const inputY = calculateInputTop(idx, array);
                const {roundedX, roundedY} = getClosestBlock(g.position?.x??0, g.position?.y ? g.position.y + inputY + DEFAULT_INPUT_DIM.height : 0);
                //console.log(`g.Position: ${g.position?.x} ${g.position?.y}`);
                if(roundedY === y && x === g.position?.x){
                    console.log(`POINT IN ${g.inputs[idx].id}`);
                    if(g.inputs[idx].wires?.[0]?.id === wire.id){
                        return;
                    }
                    dispatch(addWireToGateInput({gate:g,inputIdx:idx,wire:wire}));
                }else if(g.inputs[idx].wires?.[0]?.id === wire.id){
                    dispatch(addWireToGateInput({gate:g,inputIdx:idx,wire:null}))
                }
            })
        })
    }
    
    return checkRectInputs;
}