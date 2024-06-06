import { Wire } from "../Interfaces/Wire";
/**
 * If a wire is connected to the ID, remove the ID from the "connectedTo" list
 * @param wires The wires state
 * @param ioId The ID to remove from the wires
 * @returns {Object.<string, Wire>} The new wires state
 */
export default function removeWireTo(wires: {[key: string]: Wire}, ioId: string) : {[key:string]: Wire} {
    const wireEntries = Object.entries(wires);
    const newWires: {[key:string]: Wire} = {};
    for(const [key, wire] of wireEntries){
        wire.connectedToId?.forEach((connection, idx) => {
            if(connection.id === ioId){
                wire.connectedToId?.splice(idx, 1);
                newWires[key] = wire;
                return;
            }
        })
        
        wire.wirePathConnectedTo?.forEach((pathConnectedTo, idx) => {
            if(pathConnectedTo.id === ioId){
                wire.wirePathConnectedTo?.splice(idx, 1);
                newWires[key] = wire;
                return;
            }
        })
        if(!newWires[key]){
            newWires[key] = wire;
        }
    }
    return newWires;
}