import { Wire } from "@Shared/interfaces";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { buildWireTree } from "../utils/buildWireTree";
import { getConnections } from "../utils/getConnections";
import { ShortCircuitError } from "../utils/clock";
import { connect } from "http2";

onmessage = function(event: MessageEvent<{
    wires?: {[key: string]: Wire},
    io?: {[key: string]: BinaryIO},
    lineWidth?: number,
    cameraOffset?: {x: number, y: number},
    ioRadius?: number,
    currentComponentId?: string,
    action?: 'check' | 'update'
}>

){
	const wires = event.data.wires as {[key: string]: Wire};
	const lineWidth = event.data.lineWidth;
	const io = event.data.io;
	const cameraOffset = event.data.cameraOffset;
	const ioRadius = event.data.ioRadius;
	const currentComponentId = event.data.currentComponentId;
	const wireEntries = Object.entries(wires);
	const allWireTrees: string[][] = [];

	if(event.data.action === 'check'){
		for(const [key, wire] of wireEntries){
			let wireInTree = false;
			allWireTrees.forEach(tree => {
				if(tree.includes(key)){
					wireInTree = true;
				}
			});
			if(wireInTree){
				continue;
			}
			allWireTrees.push(buildWireTree(key, wires, lineWidth!));
		}
    
		const connections: {wireTree: string[], outputs: string[], sourceIds: string[]|null}[] = [];
		try{
			allWireTrees.forEach(tree => {
				const {outputs, sourceIds, error} = getConnections(tree, wires, io!, cameraOffset!, ioRadius!, currentComponentId!);
				if(error){
					return;
				}
				connections.push({wireTree: tree, outputs: outputs, sourceIds: sourceIds});
			});

			this.postMessage(
                {
                	connections: connections
                } as connectingWorkerEvent
			);
		}catch(error){
			if(error instanceof ShortCircuitError){
				console.error(`Short circuit error in the connection worker`);
				this.postMessage({connections: connections, error: {isError: true, wireTree: error.wireTree}});
			}
		}
	}
};

export interface connectingWorkerEvent {
    connections: {
        wireTree: string[],
        outputs: string[],
        sourceIds: string[] | null,
    }[],
    error?: {isError: boolean, wireTree: string[]}
}