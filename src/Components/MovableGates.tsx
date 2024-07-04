import React from 'react';
import { Gate } from '../Interfaces/Gate';
import { CustomGate } from './CustomGate';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

const checkEquality = (prev:{[key:string]:Gate}, next: {[key:string]:Gate}) => {
	if(Object.entries(prev).length !== Object.entries(next).length){
		return false;
	}else{
		return true;
	}
};

export default function MovableGates(){
	const movableGates = useSelector((state: RootState) => {
		const globalGates: {[key: string]: Gate} = {}
		Object.entries(state.entities.gates).forEach(([key, gate]) => {
			if(gate.parent === 'global'){
				globalGates[key] = gate;
			}
		})
		return state.entities.gates;
	}, checkEquality);
	return <>
		{Object.entries(movableGates)?.map(([key, gate]) => {
			return <CustomGate gateProps={gate} preview={false} key={gate.id} position='absolute'></CustomGate>;
		})}
	</>;
}