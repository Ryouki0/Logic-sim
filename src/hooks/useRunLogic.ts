import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { Gate } from '../Interfaces/Gate';
import { createSelector } from '@reduxjs/toolkit';
import { create } from 'domain';
import { setActuals, setActualHertz, setHertz } from '../state/slices/clock';
import { updateState } from '../state/slices/entities';
import { WorkerEvent } from '../logic.worker';
const checkGateEquality = (prev: {[key: string]: Gate}, next: {[key: string]: Gate}) => {
	const prevEntires = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntires.length !== nextEntries.length){
		return false;
	}
	return true;
}; 

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
    
	const shouldUpdateWorker = useRef(true);
	const calls = useRef(0);
	const newWorkerData = useRef<WorkerEvent | null>(null);
	const dispatch = useDispatch();

	const { copiedGates, copiedIo } = useMemo(() => {
		if(!isRunning) return {copiedGates: null, copiedIo: null};
		const copiedGates = JSON.parse(JSON.stringify(gates));
		Object.entries(currentComponent.gates).forEach(([key, gate]) => {
			copiedGates[key] = gate;
		});
    
		const copiedIo = JSON.parse(JSON.stringify(io));
		Object.entries(currentComponent.binaryIO).forEach(([key, ioItem]) => {
			copiedIo[key] = ioItem;
		});
    
		return {copiedGates, copiedIo};
	}, [gates, currentComponent, io, isRunning]);

	useEffect(() => {
		const logicWorker = require('../logic.worker.ts').default;
		importedWorkerRef.current = logicWorker;
	}, []);

	useEffect(() => {
		calls.current++;
		if (isRunning && !workerRef.current) {
			//@ts-ignore
			workerRef.current = new importedWorkerRef.current();

            workerRef.current!.onmessage = (event: MessageEvent<WorkerEvent>) => {
                
            	function update(){
            		newWorkerData.current = event.data;
            		shouldUpdateWorker.current = false;
            		timeTook.current = Date.now() - timeTookStart.current;
                    
            		const newData = newWorkerData.current;
            		dispatch(updateState({gates: newData!.gates, binaryIO: newData!.binaryIO}));
            		actualRefreshRate.current++;
            		actualHertz.current += newData!.actualHertz;
                    
            		if(Date.now() - startTime.current >= 1000){
            			dispatch(setActuals({actualHertz: actualHertz.current, actualRefreshRate: actualRefreshRate.current}));
            			startTime.current = Date.now();
            			actualHertz.current = 0;
            			calls.current = 0;
            			actualRefreshRate.current = 0;
            		}
            	}
            	update();
            };
            
            const refreshTime = Math.trunc(1000 / refreshRate);
            timeTookStart.current = Date.now();
            console.time(`post message on main thread`);
            const message = JSON.stringify({
            	gates: copiedGates,
            	io: copiedIo,
            	refreshRate: refreshRate,
            	hertz: hertz,
            	startTime: timeTookStart.current
            });
            workerRef.current?.postMessage(message);
            console.timeEnd(`post message on main thread`);
		}
		return () => {
			if(workerRef.current && shouldUpdateWorker.current) {
				workerRef.current.terminate();
				workerRef.current = null;
				if(intervalRef.current){
					clearInterval(intervalRef.current);
				}
			}else if(!shouldUpdateWorker.current){
				shouldUpdateWorker.current = true;
			}
		};
	}, [isRunning, refreshRate, hertz, copiedGates, copiedIo]);
}