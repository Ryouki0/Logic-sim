import React, { useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../state/store';
// import { Gate } from '../Interfaces/Gate';
// import { changeGateOutput, updateState } from '../state/slices/entities';
// import deepCopyComponent from '../utils/deepCopyComponent';
// import { BinaryOutput } from '../Interfaces/BinaryOutput';
// import { BinaryInput } from '../Interfaces/BinaryInput';

// export default function useClock(){
//     const gates = useSelector((state: RootState) => {return state.entities.gates});
//     const inputs = useSelector((state: RootState) => {return state.entities.globalInputs});
//     const outputs = useSelector((state: RootState) => {return state.entities.globalOutputs});
//     const hertz = useSelector((state: RootState) => {return state.clock.hertz});
//     const logicRef = useRef(0);
//     const dispatch = useDispatch();
//     useEffect(() => {
//         logicRef.current = 0;

//         //1. Create a deep copy of the state
//         //2. In a for loop do the logic on the copy (as many times as there are hertz)
//         //3. Update the state
//         //First get the gates whose inputs are not connected to anything, or connected to globalInputs
//         const {newInputs, newOutputs, newGates} = deepCopyComponent(gates, inputs, outputs);
      
//         for(let i =0;i<1;i++){
//             logic({
//                 gates: newGates,
//                 inputs: newInputs,
//                 outputs: newOutputs});
//         }
//         /**
//          * Get the gates whose inputs are not from other gates
//          * @param gates The copy of the gates
//          * @returns The first layer (roots)
//          */
//         function getPathRoot(gates: {[key: string]: Gate}){
//             const gateEntries = Object.entries(gates);
//             const roots: {[key: string]:Gate} = {};
//             gateEntries.forEach(([key, gate]) => {
//                 let isRootOfPath = true;
//                 const inputEntries = Object.entries(gate.inputs);
//                 inputEntries.forEach(([key, input]) => {
//                     if(input.from?.gateId){
//                         isRootOfPath = false;
//                     }
//                 })
//                 if(isRootOfPath){
//                     roots[key] = gate;
//                 }
//             })
//             return roots;
//         }

//         /**
//          * Runs the logic inside a component
//          * @param component The component that gets the logic run. Everything that is on the screen makes up a component, 
//          * just like any other created component
//          */
//         function logic(component: {
//             gates: {[key:string]: Gate}, 
//             outputs: {[key:string]: BinaryOutput}, 
//             inputs: {[key:string]: BinaryInput},
//             isSubComponent?: boolean,
//             isTwoLayerDeep?: boolean,
//         }){
//             if(component.isSubComponent){
//                 logicRef.current++;
//             }
//             const roots = getPathRoot(component.gates);
//             let currentLayer: {[key: string]: Gate} = roots;
//             let nextLayer: {[key:string]: Gate} = {};
//             while(Object.entries(currentLayer).length > 0){
//                 nextLayer = {};
//                 Object.entries(currentLayer).forEach(([key, gate], idx, array) => {
//                     if(gate.name === 'AND'){
//                         let areBothTrue = true;
//                         Object.entries(gate.inputs).forEach(([key, input]) => {
//                             if(input.from?.gateId){
//                                 if(component.gates[input.from?.gateId].outputs[input.from.id].state === 0){
//                                     areBothTrue = false;
//                                 }
//                             }else if(input.from){
//                                 if(component.inputs[input.from.id].state === 0){
//                                     areBothTrue = false;
//                                 }
//                             }else if(!input.from){
//                                 areBothTrue = false;
//                             }
//                         })
    
//                         Object.entries(component.gates[key].outputs).forEach(([key, output]) => {
//                             component.gates[gate.id].outputs[key].state = areBothTrue ? 1 : 0;
//                             output.to?.forEach(to => {
//                                 if(to.gateId){
//                                     component.gates[to.gateId].inputs[to.id].state = component.gates[gate.id].outputs[key].state;
//                                     nextLayer[to.gateId] = component.gates[to.gateId];
//                                 }else {
//                                     component.outputs[to.id].state = component.gates[gate.id].outputs[key].state;
//                                     if(component.isSubComponent){
//                                         //console.log(`changing subComponent state to: ${component.outputs[to.id].state}`)
//                                     }
//                                 }
//                             })
//                         })
                       
//                     }else if(gate.name === 'NO'){
//                         let inputState = true;
//                         Object.entries(gate.inputs).forEach(([key, input]) => {
//                             if(input.from?.gateId){
//                                 if(component.gates[input.from.gateId].outputs[input.from.id].state === 0){
//                                     inputState = false;
//                                 }
//                             }else if(input.from){
                                
//                                 if(component.inputs[input.from.id].state === 0){
//                                     inputState = false;
//                                 }
//                             }else if(!input.from){
//                                 inputState = false;
//                             }
//                             console.log(`No input state: ${input.state} No input from state: ${component.inputs[input.from?.id??'']?.state}`);
//                         })
//                         Object.entries(component.gates[gate.id].outputs).forEach(([key, output])=>{
//                             component.gates[gate.id].outputs[key].state = inputState ? 0 : 1;
//                             output.to?.forEach(to => {
//                                 if(to.gateId){
                                    
//                                     component.gates[to.gateId].inputs[to.id].state = component.gates[gate.id].outputs[key].state;
//                                     nextLayer[to.gateId] = component.gates[to.gateId];
//                                 }else {
//                                     component.outputs[to.id].state = component.gates[gate.id].outputs[key].state;
//                                     if(component.isTwoLayerDeep){
//                                         console.log(`two layers deep changing output to: ${component.gates[gate.id].outputs[key].state}`)
//                                     }
//                                 }
//                             })
//                         })
                       
//                     }else if (gate.gates){
                        

//                         logic({gates: gate.gates, inputs: gate.inputs, outputs: gate.outputs, isSubComponent: true,
//                         isTwoLayerDeep: gate.name === 'testName' ? true :false});
//                         Object.entries(gate.outputs).forEach(([key, output])=> {
//                             output.to?.forEach(to => {
//                                 if(to.gateId){
                                    
//                                     component.gates[to.gateId].inputs[to.id].state = output.state;
//                                     nextLayer[to.gateId] = component.gates[to.gateId];
//                                 }else{
//                                     if(component.isSubComponent){
//                                     }
//                                     component.outputs[to.id].state = output.state;
//                                 }
//                             })
//                         })
                      
//                     }
//                     if(gate.name === 'testName'){
//                         Object.entries(gate.inputs).forEach(([key, input]) => {
//                             console.log(`testName input state: ${input.state}`);
//                         })
//                         Object.entries(gate.outputs).forEach(([key, output]) => {
//                             console.log(`testName output state: ${output.state}`);
//                         })
//                         Object.entries(component.inputs).forEach(([key, input]) => {
//                             console.log(`testName's globalINput state: ${input.state}`);
//                         })
//                         Object.entries(gate.inputs).forEach(([key, input]) => {
//                             if(input.from?.gateId){

//                             }else if (input.from){
//                                 console.log(`testname input from state: ${component.inputs[input.from.id].state}`)
//                             }
//                         })
//                         Object.entries(component.outputs).forEach(([key, output]) => {
//                             console.log(`testName globaloutput state: ${output.state}`);

//                         })
//                     }
//                     if(idx === array.length-1){
//                         currentLayer = nextLayer;
//                     }
//                 })

//             }
            
            
//         }
//         function update(){
//             dispatch(updateState({gates: newGates, inputs: newInputs, outputs: newOutputs}));
//         }
//         const timer = setInterval(update,1000);
//         return () => {
//             clearInterval(timer);
//         }
//     }, [gates, inputs, outputs])
// }
