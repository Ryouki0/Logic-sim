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
    console.log(`worker`);
    const hertz = event.data.hertz;
    const refreshRate = event.data.refreshRate;
    const maxHertzInLoop = hertz / refreshRate;
    const loopTime = 1000 / refreshRate;
    const workerStartTime = Date.now();
    console.log(`time elapsed since passing in the data: ${Date.now() - event.data.startTime}`);
    const avgError = 2;
    let gates = event.data.gates;
    let io = event.data.io;
    let actualHertz = 0;

    const hertzList:number[] = Array(refreshRate).fill(Math.floor(maxHertzInLoop));
    
    const remainder = hertz % refreshRate;
    for(let i = 0; i< remainder;i++){
        hertzList[i]++;
    }
    while(true){
        for(const currentMaxHertz of hertzList){
            const thisStartTime = Date.now();
            actualHertz = 0;
            for(let i = 0;i<currentMaxHertz;i++){
                console.log(`currentMaxHertz: ${currentMaxHertz}`);
                const newState = logic({gates: gates, io: io, level: 'global'});
                
                actualHertz++;
                gates = newState.gates;
                io = newState.io;
                if(Date.now() - thisStartTime >= loopTime - avgError){
                    break;
                }
            }
            postMessage({gates: gates, binaryIO: io, actualHertz: actualHertz} as WorkerEvent);
            await pause(loopTime - (Date.now() - thisStartTime) - avgError);
        }
    }
}

export interface WorkerEvent {
    gates: {[key: string]: Gate},
    binaryIO: {[key: string]: BinaryIO},
    actualHertz: number,
};