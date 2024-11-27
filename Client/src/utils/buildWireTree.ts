import { Wire } from "@Shared/interfaces";
import isWireConnectedToWire from "./Spatial/isWireConnectedToWire";

/**
* Gives back a list of wire IDs that are connected to the given wire
* @param {string} wireId A random wire that is not in any wire tree yet
* @param {{[key: string]: Wire}} wires The wires in the current component
* @param {number} lineWidth The lineWidth state
* @returns {string[]}  The wire tree
*/
export function buildWireTree(wireId: string, wires: {[key: string]: Wire}, lineWidth: number): string[] {
    const nextWires:string[] = [wireId];
    const wireTree: string[] = [];
    while(nextWires.length >0){
        const currentWireId = nextWires.pop();
        if(!currentWireId){
            throw new Error(`When building wire tree, there is no currentWire!: ${currentWireId}`);
        }
        const currentWire = wires[currentWireId];
        
        wireTree.push(currentWireId);
        Object.entries(wires).forEach(([key, wire]) => {
            if(key === currentWireId){
                return;
            }
            if(wireTree.includes(key)){
                return;
            }
            if(isWireConnectedToWire(wire, currentWire, lineWidth)){
                nextWires.push(key);
            }else if(isWireConnectedToWire(currentWire, wire, lineWidth)){
                nextWires.push(key);
            }
        });
    }
    
    return wireTree;
}