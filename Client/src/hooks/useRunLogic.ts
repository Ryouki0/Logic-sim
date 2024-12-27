import React, { useEffect, useMemo, useRef } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { setActuals, setError, setIsRunning, setPhase } from '../state/slices/clock';
import { fastUpdateRaw, updateNonAffectingInputs, updateState, updateStateRaw } from '../state/slices/entities';

import { WorkerEvent } from '../workers/logic.worker';
import { parseHue } from '@uiw/react-color';
import { Gate, Wire } from '@Shared/interfaces';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { add } from 'lodash';
import { addNotification } from '../state/slices/mouseEvents';

export function checkCurrentComponent(
	prev: {wires: {[key: string]: Wire}, binaryIO: {[key: string]: BinaryIO}, gates: {[key: string]: Gate}},
	next: {wires: {[key: string]: Wire}, binaryIO: {[key: string]: BinaryIO}, gates: {[key: string]: Gate}}
) {
	const prevIOEntries = Object.entries(prev.binaryIO);
	const nextIOKeys = Object.keys(next.binaryIO);
	if(prevIOEntries?.length !== nextIOKeys?.length) return false;
	for(const [key, io] of prevIOEntries){
		if(io.state !== next.binaryIO[key].state) return false;
		if(io.position?.x !== next.binaryIO[key].position?.x || io.position?.y !== next.binaryIO[key].position?.y) return false;
		if(io.from?.length !== next.binaryIO[key].from?.length) return false;
		if(io.to?.length !== next.binaryIO[key].to?.length) return false;
	}
	return true;
}


export default function useRunLogic(){
	const hertz = useSelector((state: RootState) => {return state.clock.hertz;});
	const refreshRate = useSelector((state: RootState) => {return state.clock.refreshRate;});
	const isRunning = useSelector((state: RootState) => {return state.clock.isRunning;});
	const currentComponent = useSelector((state: RootState) => {return state.entities.currentComponent;});
	const io = useSelector((state: RootState) => {return state.entities.binaryIO;});
	const gates = useSelector((state: RootState) => {return state.entities.gates;});
    
	const workerRef = useRef<Worker | null>(null);
	const importedWorkerRef = useRef();
    
	const intervalRef = useRef<NodeJS.Timer | null>();
	const startTime = useRef<number>(Date.now());
	const actualHertz = useRef<number>(0);
	const actualRefreshRate = useRef<number>(0);
	const timeTookStart = useRef(0);
	const timeTook = useRef(0);
    
	/**
	 * Marks if the worker should be recreated, only `fastUpdate` should make it false
	 */
	const shouldUpdateWorker = useRef(true);
	const calls = useRef(0);
	const newWorkerData = useRef<WorkerEvent | null>(null);
	const dispatch = useDispatch();
	const currentPhaseRef = useRef<string>('');
	const currentPhase = useSelector((state: RootState) => {return state.clock.clockPhase;});
	useEffect(() => {
		const logicWorker = require('../workers/logic.worker.ts').default;
		importedWorkerRef.current = logicWorker;
	}, []);

	/**
	 * Bug: WHY does the fastUpdate doesn't have the latest data???????????? - The worker can't
	 * process the onmessage call while it calculates the new state, so it doesn't stop immediately, only after it did it's last `fastUpdate`.
	 * The `pause` function is async thus allowing other tasks to be executed
	 */
	useEffect(() => {
		calls.current++;
	
		if (isRunning && !workerRef.current) {
			initializeWorker();
			startWorker();
		}
	
		return () => cleanupWorker();
	}, [isRunning, refreshRate, hertz, currentComponent]);

	function initializeWorker() {
		//@ts-ignore
		workerRef.current = new importedWorkerRef.current();
		workerRef.current!.onmessage = handleWorkerMessage;
		timeTookStart.current = Date.now();
		dispatch(setPhase('starting'));
		currentPhaseRef.current = 'starting';
	}

	function startWorker() {
		const message = JSON.stringify({
			currentComponent,
			gates,
			io,
			refreshRate,
			hertz,
			startTime: timeTookStart.current,
		});
		console.log('passing in the new data');
		workerRef.current?.postMessage(message);
	}

	function cleanupWorker() {
		if (workerRef.current && shouldUpdateWorker.current) {
			/**
			 * If there are fast consecutive changes, then don't wait for the worker to update
			 */
			if(currentPhaseRef.current === 'starting'){
				workerRef.current.terminate();
				workerRef.current = null;
				currentPhaseRef.current = '';
			}else{
				workerRef.current.postMessage({ action: 'stop' });
				dispatch(setPhase('stopping'));
				currentPhaseRef.current = 'stopping';
			}
			
			// console.log('about to be stopped in cleanup');
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
			
		} else if (!shouldUpdateWorker.current) {
			shouldUpdateWorker.current = true;
		}
	}


	function handleWorkerMessage(event: MessageEvent<WorkerEvent>) {
		if (event.data.error) {
			handleWorkerError(event.data.error);
		} else if (event.data.nonAffectingInputs) {
			handleNonAffectingInputs(event.data.nonAffectingInputs);
		} else if (event.data.currentComponentIo) {
			if(currentPhaseRef.current === 'stopping'){
				// console.log('skipping');
				return;
			} 
			fastUpdate(event);
		} else if (event.data.phase === 'started') {
			dispatch(setPhase(null));
			currentPhaseRef.current = 'started';
		} else if (event.data.binaryIO) {
			handleUpdate(event);
		}
	}

	function handleWorkerError(error: string) {
		dispatch(setError({ isError: true, extraInfo: error }));
		dispatch(setIsRunning(false));
		dispatch(setPhase(null));
		dispatch(addNotification({ id: Math.random().toString(), info: `${error}`, status: 'error' }));
		workerRef.current = null;
	}

	function handleNonAffectingInputs(nonAffectingInputs: string[]) {
		const nonAffectingInputsSet = new Set(nonAffectingInputs);
		shouldUpdateWorker.current = false;
		dispatch(updateNonAffectingInputs(nonAffectingInputsSet));
	}

	function handleUpdate(event: MessageEvent<WorkerEvent>) {
		fullUpdate(event);
		dispatch(setPhase(null));
		workerRef.current = null;
		// console.log('update should be done');
	}

	function fastUpdate(event: MessageEvent<WorkerEvent>) {
		newWorkerData.current = event.data;
		shouldUpdateWorker.current = false;
		timeTook.current = Date.now() - timeTookStart.current;
	
		const newData = newWorkerData.current;
		dispatch(fastUpdateRaw(newData.currentComponentIo!));
		trackPerformance(newData!.actualHertz);
	}

	function fullUpdate(event: MessageEvent<WorkerEvent>) {
		newWorkerData.current = event.data;
		shouldUpdateWorker.current = true;
		timeTook.current = Date.now() - timeTookStart.current;
	
		const newData = newWorkerData.current;
		dispatch(updateStateRaw({ gates: newData!.gates, binaryIO: newData!.binaryIO }));
		trackPerformance(newData!.actualHertz);
	}

	function trackPerformance(hertz: number) {
		actualRefreshRate.current++;
		actualHertz.current += hertz;
	
		if (Date.now() - startTime.current >= 1000) {
			dispatch(setActuals({ actualHertz: actualHertz.current, actualRefreshRate: actualRefreshRate.current }));
			startTime.current = Date.now();
			actualHertz.current = 0;
			calls.current = 0;
			actualRefreshRate.current = 0;
		}
	}

	


	
	
	
}