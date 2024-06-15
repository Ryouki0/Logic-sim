import { Gate } from "../Interfaces/Gate";
// import {v4 as uuidv4} from 'uuid';
// import { deepCopyGate, deepCopyInputs } from "./deepCopyComponent";

// /**
//  * Replaces the inputs' and outputs' ID's with new ones, and adds the gateId to them
//  * @param gate The gate to create
//  * @returns The modified gate
//  */
// export default function replaceIds(gate:Gate){
//     const newGateId = uuidv4();
    
//     Object.entries(gate.inputs).forEach(([key, input])=>{
//         const newInputId = uuidv4();
//         input.to?.forEach((to,idx) => {
//             if(to.gateId && gate.gates){
//                 const from = gate.gates[to.gateId].inputs[to.id].from;
//                 if(!from){return}
//                 from.id = newInputId;
//                 console.log(`newId: ${newInputId.slice(0,5)}`);
//             }
//         })
//         gate.inputs[key].id = newInputId;
//         gate.inputs[newInputId] = {...gate.inputs[key]};
//         delete gate.inputs[key];
//     })
//     Object.entries(gate.outputs).forEach(([key,output]) => {
//         const newOutputId = uuidv4();
//         if(output.from?.gateId && gate.gates){
//             //The source might be connected to multiple outputs, so find the index of this output
//             const idx = gate.gates[output.from.gateId].outputs[output.from.id].to?.findIndex(to => to.id === key);
//             if(idx !== undefined && idx !== -1){
//                 //@ts-ignore
//                 gate.gates[output.from.gateId].outputs[output.from.id].to[idx].id = newOutputId;
//             }
//         }
//         gate.outputs[newOutputId] = {...gate.outputs[key], id: newOutputId};
//         delete gate.outputs[key];
//     })
//     gate.id = newGateId;
//     return gate;
// }