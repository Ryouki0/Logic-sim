import { getImpliedNodeFormatForFile, isObjectBindingPattern } from "typescript";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { Gate } from "../Interfaces/Gate";
import { current } from "@reduxjs/toolkit";
import { deepCopyComponent } from "./deepCopyComponent";

/**
* 1. Get the main order in the component
*   a. Create a "mainOrder" list
*   b. Get the first layer of gates (The gates that are not connected from any other gate)
*   c. Put the first layer of gates into the main order
*   d. For each element of the main order, check if that gate is connected to other gates
*      -if it is, check that gates' inputs, to see if all the inputs' "from" gate ID is already in the main order
*      -if the gate is dependent on a gate, that is not already in the main order, then skip it
*      -if not, add the gate to the main order
* @param component The component where the logic runs
*/
export function logic(component: {
    gates: {[key: string]: Gate},
    io: {[key: string]: BinaryIO}
 })
 {
    const {gates, io} = deepCopyComponent({gates: component.gates, io: component.io});
    const mainOrder = getMainOrder(gates, io);
    mainOrder.forEach(gateId => {
        const gate = gates[gateId];
        console.log(`${gateId.slice(0,5)} -- ${gate.name}`);
        if(gate.name === 'AND'){
            let areBothTrue = true;
            gate.inputs.forEach(inputId => {
                if(io[inputId].state !== 1){
                    areBothTrue = false;
                }
            })
            const output = io[gate.outputs[0]];
            output.state = areBothTrue ? 1 : 0; 
            propagateIoStateChange(output.id, io);
        }else if(gate.name === 'NO'){
            let isInputTrue = true;
            gate.inputs.forEach(inputId => {
                if(io[inputId].state !== 1){
                    isInputTrue = false;
                }
            })
            const output = io[gate.outputs[0]];
            output.state = isInputTrue ? 0 : 1;
            propagateIoStateChange(output.id, io);
        }else if(gate.name === 'DELAY'){
            const output = io[gate.outputs[0]];
            const input = io[gate.inputs[0]];
            output.state = gate.nextTick!;
            gate.nextTick = input.state;
            propagateIoStateChange(output.id, io);
        }
    })    
    return {gates, io};
 }
 
 /**
  * Determines the order of the gates
  * @param gates The gates in the component
  * @param io The IO in the component
  * @returns Returns a list of gate IDs in execution order
  */
export function getMainOrder(gates: {[key: string]: Gate}, io: {[key: string]: BinaryIO}){
    const mainOrder: string[] = [];
    let currentLayer = getPathRoots(gates, io);
    let nextLayer: string[] = [];
    currentLayer.forEach(gateId =>{
        console.log(`gateId in the roots: ${gateId.slice(0,5)}`);
    })
    //This is to store the whole current layer, when "currentLayer" runs out of elements, push this into the "mainOrder"
    mainOrder.push(...currentLayer);
    while(currentLayer.length > 0){
        const currentGate = gates[currentLayer.pop()!];
        const connectedGateIds = currentGate.outputs.flatMap(outputId => {
            const output = io[outputId];
            const gateIds: string[] = [];
            output.to?.forEach(to => {
                if(to.gateId){
                    gateIds.push(to.gateId);
                }
            })
            return gateIds;
        })
        
        //Look back the connected gates' source gates
        connectedGateIds.forEach(gateId => {
            const gate = gates[gateId];
            let isNextLayer = true;
            gate.inputs.forEach(inputId => {
                const input = io[inputId];
                if(input.from?.gateId && !mainOrder.includes(input.from?.gateId)){
                    isNextLayer = false;
                }
            })
            if(isNextLayer){
                nextLayer.push(gateId);
            }
        })
        if(currentLayer.length === 0){
            currentLayer.push(...nextLayer);
            mainOrder.push(...nextLayer);
            nextLayer = [];
        }
    }
    return mainOrder;
}
 /**
 * Gives back the first layer of gates (the gates that are not connected from other gates)
 * @param gates The top level gates inside the component
 * @param io The IOs inside the component
 * @returns A list of gate IDs
 */
 export function getPathRoots(gates:{[key: string]: Gate}, io: {[key: string]: BinaryIO}){
     const gateEntries = Object.entries(gates);
     const roots: string[] = [];
     for(const [key, gate] of gateEntries){
         let isRoot = true;
         gate.inputs.forEach(inputId => {
            const from = io[io[inputId].from?.id!];
            if(from?.gateId && !from?.isGlobalIo){
                isRoot = false;
            }
        })
        if(isRoot){
            roots.push(key);
        }
     }
     return roots;
 }
 
/**
* Propagates an I/O's state
* @param ioId The I/O ID whose state is propagated to every connected I/O 
* @param io The whole I/O state
* @returns The new I/O state
*/
export function propagateIoStateChange(ioId: string, io: {[key: string]: BinaryIO}){
     const nextIos: string[] = [ioId];
     const newState = io[ioId].state;
     while(nextIos.length > 0){
         const currentIoId = nextIos.pop();
         const currentIo = io[currentIoId!];
         currentIo.state = newState;
         currentIo.to?.forEach(to => {
             nextIos.push(to.id);
         })
     }
     return io;
 }

/**
 * Gives back a list of gate IDs that are connected to the "ioId"
 * @param ioId The ID whose gate connections are given back
 * @param io The IO state
 */
 export function getConnectedGates(ioId: string, io: {[key: string]: BinaryIO}){
    const connectedGates: Set<string> = new Set();
    io[ioId]?.to?.forEach(to => {
        if(to.gateId && !io[to.id]?.isGlobalIo){
            connectedGates.add(to.gateId);
        }
    })
    return Array.from(connectedGates);
 }