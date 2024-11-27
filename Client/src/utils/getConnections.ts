import { Wire } from "@Shared/interfaces";
import { ShortCircuitError } from "./clock";
import { BinaryIO } from "../Interfaces/BinaryIO";
import isOnIo from "./Spatial/isOnIo";

/**
 * Traverses the wire tree and gets the I/Os on the endpoints of the wires
 * @param wireTree The wire tree
 * @throws ShortCircuitError if there are two or more sources of the wire tree, that are not in high impedance state
 * @returns An object containing the sources and outputs
 */
export function getConnections(
    wireTree: string[], 
    wires: {[key: string]: Wire}, 
    io: {[key: string]: BinaryIO},
    cameraOffset: {x: number, y:number},
    ioRadius: number,
    currentComponentId: string,
):{outputs:string[], sourceIds: string[]|null, error?: boolean,
}{
    const outputs:string[] = [];
    const sourceIds: string[]|null = [];
        wireTree.forEach(wireId => {
            const wire = wires[wireId];
            Object.entries(io).forEach(([key, ioEntry]) => {
                const isOnWire = 
                (isOnIo(wire.linearLine.startX + cameraOffset.x, wire.linearLine.startY + cameraOffset.y, ioEntry, cameraOffset, ioRadius)) ||
                (isOnIo(wire.diagonalLine.endX + cameraOffset.x, wire.diagonalLine.endY + cameraOffset.y, ioEntry, cameraOffset, ioRadius));
                
                if(isOnWire){
                    if(
                        (ioEntry.type === 'input' && !ioEntry.gateId) 
                        || (ioEntry.type === 'output' && ioEntry.gateId && ioEntry.gateId !== currentComponentId) 
                        || (ioEntry.type === 'input' && ioEntry.gateId && ioEntry.gateId === currentComponentId)
                    ){
                        if(sourceIds!.includes(key)) return;
                        sourceIds!.forEach(sourceId => {
                            if(!io[sourceId].highImpedance && !ioEntry.highImpedance){
                                console.warn(`Short circuit! ${sourceId.slice(0,5)} -> ${key.slice(0,5)}`);
                                throw new ShortCircuitError(wireTree);
                            }	
                        }); 
                            
                        
                        sourceIds!.push(key);
                        return;
                    }
                    outputs.push(key);
                }
            });
        });    
    return {outputs, sourceIds};
}