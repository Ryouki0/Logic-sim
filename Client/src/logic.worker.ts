import { BinaryIO } from "./Interfaces/BinaryIO";
import { Gate, Wire } from "@Shared/interfaces";
import { buildPath, CircularDependencyError, evaluateGates, getAllBaseGates, globalSort } from "./utils/clock";
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
	Object.entries(parsedData.currentComponent.binaryIO).forEach(([key, io]) => {
		copiedIo[key] = {...io, affectsOutput: false};
	});
	

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
	

	const propagatedDelays: Set<string> = new Set();
	const allNonAffectingInputs: string[] = [];
	const baseGateIds = getAllBaseGates(gates);
	while(true){
		const delayId = order.find(id => gates[id].name === 'DELAY' && !propagatedDelays.has(id));
		const delayGate = gates[delayId!];
		console.log(`delayGate: ${delayGate}`);
		if(!delayGate) break;
		const nextIos = [delayGate.outputs[0]];
		allNonAffectingInputs.push(delayGate.inputs[0]);
		while(nextIos.length > 0){
			const currentId = nextIos.pop()!;

			const nonAffectingInputs = findNonAffectingInputs(gates, io, currentId, baseGateIds);

			nonAffectingInputs.forEach(id => {
				if(allNonAffectingInputs.includes(id)) return;
				allNonAffectingInputs.push(id);
				nextIos.push(id);
			});

		}
		propagatedDelays.add(delayId!);

	}
	//this.postMessage({nonAffectingInputs: allNonAffectingInputs});
	allNonAffectingInputs.forEach(id => {
		io[id].affectsOutput = true;
	});
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
	starting?: boolean,
	nonAffectingInputs?: string[]
};