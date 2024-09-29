import { BinaryIO } from "./Interfaces/BinaryIO";
import { Gate, Wire } from "@Shared/interfaces";
import { buildPath, CircularDependencyError, evaluateGates, globalSort } from "./utils/clock";
import { ShortCircuitError } from "./utils/clock";
import findNonAffectingInputs from "./utils/findNonAffectingInputs";

async function pause(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
onmessage = async function (event: MessageEvent<{
    currentComponent: {
		gates: {[key: string]:Gate},
		binaryIO: {[key: string]: BinaryIO},
		wires: {[key: string]: Wire},
	},
	gates: {[key: string]: Gate},
    io: {[key: string]: BinaryIO},
    refreshRate: number,
    hertz: number,
    startTime: number
}>) {
	console.time(`parse`);
	const parsedData: {
		currentComponent: {
			gates: {[key: string]: Gate},
			binaryIO: {[key: string]: BinaryIO},
			wires: {[key: string]: Wire},
		},
		gates: {[key: string]: Gate},
		io: {[key: string]: BinaryIO},
		refreshRate: number,
		hertz: number,
		startTime: number
	} = JSON.parse(event.data as unknown as string);
	
	const copiedGates = JSON.parse(JSON.stringify(parsedData.gates));
	Object.entries(parsedData.currentComponent.gates).forEach(([key, gate]) => {
		copiedGates[key] = gate;
	});

	const copiedIo = JSON.parse(JSON.stringify(parsedData.io));
	Object.entries(parsedData.currentComponent.binaryIO).forEach(([key, ioItem]) => {
		copiedIo[key] = ioItem;
	});
	
	console.timeEnd(`parse`);

	const hertz = parsedData.hertz;
	const refreshRate = parsedData.refreshRate;
	const maxHertzInLoop = hertz / refreshRate;
	const loopTime = 1000 / refreshRate;
	let prevError = 0;

	const gates:{[key: string]: Gate} = copiedGates;
	const io: {[key: string]: BinaryIO} = copiedIo;
	let actualHertz = 0;
	const currentLoopNumber = 0;
    
	let hertzList:number[];
	console.log(``);
	//Create a hertz list, where the remainders are evenly spread out.
	if(hertz >= refreshRate){
		hertzList = Array(refreshRate).fill(Math.floor(maxHertzInLoop));

		const remainder = hertz % refreshRate;
		const interval = Math.floor(refreshRate / remainder);
		for(let i = 0; i< remainder;i++){
			hertzList[i*interval]++;
		}
	}else{
		hertzList = Array(refreshRate).fill(0);

		const interval = Math.floor(refreshRate / hertz);

		for(let i = 0;i<hertz;i++) {
			hertzList[(i*interval) % refreshRate] = 1;
		}
	}
    
	const {mainDag, SCCOrder} = globalSort(gates, io);
	const order = [...mainDag, ...SCCOrder];
	// order.forEach((id, idx) => {
	// 	console.log(`${idx} -- ${gates[id].name}  parent: ${gates[id].parent === 'global' ? 'global' : gates[gates[id].parent].name}`);
	// })
	const propagatedDelays: string[] = [];
	const allNonAffectingInputs: string[] = [];
	while(true){
		const {nonAffectingInputs, delayId} = findNonAffectingInputs(io, gates, SCCOrder, propagatedDelays) || {};
		if(!delayId) break;

		propagatedDelays.push(delayId);
		allNonAffectingInputs.push(...nonAffectingInputs!);
	}
	// allNonAffectingInputs.forEach((input, idx) => {
	// 	console.log(`${idx} -- ${io[input].name}`);
	// })
	let measureErrorStart = this.performance.now();
	
	while(true){
		for(const currentMaxHertz of hertzList){
			const thisStartTime = Date.now();
			measureErrorStart = this.performance.now();
			actualHertz = 0;
			for(let i = 0;i<currentMaxHertz;i++){
				try{
					evaluateGates(gates, io, order);
				}catch(err){
					if(err instanceof ShortCircuitError){
						this.postMessage({gates: gates, binaryIO: io, actualHertz: actualHertz, error: 'Short circuit'});
						break;
					}else if(err instanceof CircularDependencyError){
						this.postMessage({gates: gates, binaryIO: io, actualHertz: actualHertz, error: 'Circular dependency'});
						break;
					}
				}
                
				actualHertz++;
				if(Date.now() - thisStartTime >= loopTime-prevError){
					break;
				}
			}
			postMessage({gates: gates, binaryIO: io, actualHertz: actualHertz} as WorkerEvent);
			await pause(loopTime - (Date.now() - thisStartTime) - prevError);

			//Calculate the previous loop's error
			const shouldHavePassedTime = loopTime - prevError;
			const trueTimePassed = this.performance.now() - measureErrorStart;
			const timeDiff = shouldHavePassedTime - trueTimePassed;
			prevError = Math.floor(-(timeDiff));
		}
	}
};

export interface WorkerEvent {
    gates: {[key: string]: Gate},
    binaryIO: {[key: string]: BinaryIO},
    actualHertz: number,
	error?: 'Short circuit' | 'Circular dependency',
	starting?: boolean
};