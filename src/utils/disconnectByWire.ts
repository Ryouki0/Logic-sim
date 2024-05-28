import { BinaryInput } from "../Interfaces/BinaryInput";
import { Gate } from "../Interfaces/Gate";
import { Wire } from "../Interfaces/Wire";

/**
 * Disconnects based on a wire, and returns the new gates and globalInputs state.
 * @param gates The gates state
 * @param wire The wire to disconnect
 * @param globalInputs The globalInputs state
 * @param inputId The input the wire is connected to
 * @returns {{ gates: { [key: string]: Gate }, globalInputs: { [key: string]: BinaryInput } }}
 */
export default function disconnectByWire(gates:{[key:string]:Gate},wire:Wire, globalInputs: {[key:string]: BinaryInput},inputId: string)
    : { gates: { [key: string]: Gate; }; globalInputs: { [key: string]: BinaryInput; }; } 
    {
    
    //Remove the reference from the outputs/globalInputs
    if(wire.from?.gateId){
        const toId = gates[wire.from.gateId].outputs[wire.from.id].to?.findIndex(to => to.id === inputId);
        if(toId !== undefined && toId !== -1){
            gates[wire.from.gateId][wire.from.type][wire.from.id].to?.splice(toId, 1);
        }
    }else if(wire.from){
        const toIdx = globalInputs[wire.from.id].to?.findIndex(to => to.id === inputId);
        if(toIdx !== undefined && toIdx !== -1){
            globalInputs[wire.from.id].to?.splice(toIdx, 1);
        }
    }

    //Remove the reference from the inputs/globalOutputs(sometime)
    if(wire.connectedToId){
        wire.connectedToId.forEach(to => {
            console.log(`Wire is connected To: ${to.type} ${to.id} ${to.gateId}`);
            if(to.gateId){
                gates[to.gateId].inputs[to.id].from = null;
            }else{
            }
        })
    }
    return {gates, globalInputs};
}