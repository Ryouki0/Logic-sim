import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

export default function useClock(){
    const gates = useSelector((state:RootState) => {
        return state.objectsSlice.gates})
    const secRef = useRef(0);
    useEffect(() => {
        secRef.current = 0;
        function gateLogic(){
            secRef.current++;
            console.log(`called logic ${secRef.current}`);
            gates.forEach((gate, idx) => {
                if(gate.name === 'AND'){
                    //console.log(`AND = ${idx}---wires: ${gate.inputs[0].wires} ${gate.inputs[1].wires}`);
                }else if(gate.name === 'NO'){
                    //console.log(`NO = ${idx}---wires: ${gate.inputs[0].wires}`);
                }
            })
        }
        const id = setInterval(gateLogic ,6000)
        return () => {
            clearInterval(id);
        }
    }, [gates])
}