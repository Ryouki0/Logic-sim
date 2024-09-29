import { current } from "@reduxjs/toolkit";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { Gate } from "@Shared/interfaces";
import isBaseGate from "./isBaseGate";

export default function findNonAffectingInputs(io: {[key: string]: BinaryIO}, gates: {[key: string]: Gate}, SCCOrder: string[], propagatedDelays: string[]){
    let delayGate: null | Gate = null;
    SCCOrder.forEach(SCCId => {
        if(gates[SCCId].name === 'DELAY' && !propagatedDelays.includes(SCCId)){
            delayGate = gates[SCCId];
        }
    })
    console.log(`delaygate: ${delayGate}`);
    if(!delayGate) return;
    
    const nextIos:string[] = [(delayGate as Gate).inputs[0]];
    const nonAffectingInputs:string[] = [];
    while(nextIos.length > 0){
        const currentId = nextIos.pop();
        const currentIo = io[currentId!];
        if(!currentIo) throw new Error(`No IO at ID: ${currentId}`);
        
        if(currentIo.from){
            nextIos.push(...currentIo.from?.map(from => from.id))
        }

        if(!isBaseGate(gates[currentIo.gateId!])){
            nonAffectingInputs.push(currentId!);
        }

    }
    console.log(`returning: inputs length: ${nonAffectingInputs.length} id: ${(delayGate as Gate).id}`)
    return {nonAffectingInputs: nonAffectingInputs, delayId: (delayGate as Gate).id};
}