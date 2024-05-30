import { Wire } from "../Interfaces/Wire";
/**
 * Remove the "from" from wires that are connected to something thats gonna be deleted
 * @param wires The wires state
 * @param fromId The ID to search for, and remove
 * @returns {Object.<string, Wire>} The new wires state
 */
export default function removeWiresFrom(wires:{[key:string]:Wire}, fromId:string): {[key: string]: Wire} {
    const wireEntries = Object.entries(wires);
    const newWires: {[key: string]:Wire} = {};
    for(const [key, wire] of wireEntries){
        if(wire.from?.id === fromId){
            newWires[key] = {...wire, from: null};
        }else{
            newWires[key] = wire;
        }
    }
    return newWires;
}