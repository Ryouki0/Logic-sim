import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { Gate } from '../Interfaces/Gate';
import { changeGateOutput, updateState } from '../state/slices/entities';
import deepCopyComponent from '../utils/deepCopyComponent';
import { BinaryOutput } from '../Interfaces/BinaryOutput';
import { BinaryInput } from '../Interfaces/BinaryInput';

export default function useClock(){
    const gates = useSelector((state: RootState) => {return state.entities.gates});
    const inputs = useSelector((state: RootState) => {return state.entities.globalInputs});
    const outputs = useSelector((state: RootState) => {return state.entities.globalOutputs});
    const hertz = useSelector((state: RootState) => {return state.clock.hertz});
    const logicRef = useRef(0);
    const dispatch = useDispatch();
    useEffect(() => {
        logicRef.current = 0;

        //1. Create a deep copy of the state
        //2. In a for loop do the logic on the copy (as many times as there are hertz)
        //3. Update the state
        //First get the gates whose inputs are not connected to anything, or connected to globalInputs
        const {newInputs, newOutputs, newGates} = deepCopyComponent(gates, inputs, outputs);
        console.time('logic');
        for(let i =0;i<hertz;i++){
            logic({
                gates: newGates,
                inputs: newInputs,
                outputs: newOutputs});
        }
        console.timeEnd('logic');
        function getPathRoot(gates: {[key: string]: Gate}){
            const gateEntries = Object.entries(gates);
            const roots: {[key: string]:Gate} = {};
            gateEntries.forEach(([key, gate]) => {
                let isRootOfPath = true;
                const inputEntries = Object.entries(gate.inputs);
                inputEntries.forEach(([key, input]) => {
                    if(input.from?.gateId){
                        isRootOfPath = false;
                    }
                })
                if(isRootOfPath){
                    roots[key] = gate;
                }
            })
            return roots;
        }

        function logic(component: {
            gates: {[key:string]: Gate}, 
            outputs: {[key:string]: BinaryOutput}, 
            inputs: {[key:string]: BinaryInput}
        }){
            const roots = getPathRoot(component.gates);
            let currentLayer: {[key: string]: Gate} = roots;
            let nextLayer: {[key:string]: Gate} = {};
            while(Object.entries(currentLayer).length > 0){
                nextLayer = {};
                Object.entries(currentLayer).forEach(([key, gate], idx, array) => {
                    if(gate.name === 'AND'){
                        let areBothTrue = true;
                        Object.entries(gate.inputs).forEach(([key, input]) => {
                            if(input.state === 0){
                                areBothTrue = false;
                            }
                        })
    
                        Object.entries(component.gates[key].outputs).forEach(([key, output]) => {
                            component.gates[gate.id].outputs[key].state = areBothTrue ? 1 : 0;
                            output.to?.forEach(to => {
                                if(to.gateId){
                                    component.gates[to.gateId].inputs[to.id].state = component.gates[gate.id].outputs[key].state;
                                    nextLayer[to.gateId] = component.gates[to.gateId];
                                }else {
                                    component.outputs[to.id].state = component.gates[gate.id].outputs[key].state;
                                }
                            })
                        })
                       
                    }else if(gate.name === 'NO'){
                        let inputState = true;
                        Object.entries(gate.inputs).forEach(([key, input]) => {
                            if(input.state === 0){
                                inputState = false;
                            }
                        })
                        Object.entries(component.gates[gate.id].outputs).forEach(([key, output])=>{
                            component.gates[gate.id].outputs[key].state = inputState ? 0 : 1;
                            output.to?.forEach(to => {
                                if(to.gateId){
                                    component.gates[to.gateId].inputs[to.id].state = component.gates[gate.id].outputs[key].state;
                                    nextLayer[to.gateId] = component.gates[to.gateId];
                                }else {
                                    component.outputs[to.id].state = component.gates[gate.id].outputs[key].state;
                                }
                            })
                        })
                       
                    }
                    if(idx === array.length-1){
                        currentLayer = nextLayer;
                    }
                })

            }
            
            
        }
        function update(){
            dispatch(updateState({gates: newGates, inputs: newInputs, outputs: newOutputs}));
        }
        const timer = setInterval(update,1000);
        return () => {
            clearInterval(timer);
        }
    }, [gates, inputs, outputs])
}
