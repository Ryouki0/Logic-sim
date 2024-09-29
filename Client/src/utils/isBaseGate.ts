import { Gate } from "@Shared/interfaces";

export default function isBaseGate(gate:Gate){
    if(gate.name === 'AND' || gate.name === 'NO' || gate.name === 'SWITCH' || gate.name === 'DELAY'){
        return true;
    }else{
        return false;
    }
}