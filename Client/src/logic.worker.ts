import { BinaryIO } from "./Interfaces/BinaryIO";
import { Gate } from "./Interfaces/Gate";
import { logic } from "./utils/clock";


async function pause(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
onmessage = async function (event: MessageEvent<{
    gates: {[key: string]: Gate},
    io: {[key: string]: BinaryIO},
    refreshRate: number,
    hertz: number,
    startTime: number
}>) {
	console.time(`parse`);
	const parsedData = JSON.parse(event.data as unknown as string);
	console.timeEnd(`parse`);
	const hertz = parsedData.hertz;
	const refreshRate = parsedData.refreshRate;
	const maxHertzInLoop = hertz / refreshRate;
	const loopTime = 1000 / refreshRate;
	let prevError = 0;

	let gates = parsedData.gates;
	let io = parsedData.io;
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
    
	let measureErrorStart = this.performance.now();

	while(true){
		for(const currentMaxHertz of hertzList){
			const thisStartTime = Date.now();
			measureErrorStart = this.performance.now();
			actualHertz = 0;
			for(let i = 0;i<currentMaxHertz;i++){
				const newState = logic({gates: gates, io: io, level: 'global'});
                
				actualHertz++;
				gates = newState.gates;
				io = newState.io;
				if(Date.now() - thisStartTime >= loopTime){
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
};