import React from 'react';
import { Gate } from '../Interfaces/Gate';
import { CustomGate } from './CustomGate';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

const checkEquality = (prev:Gate[], next: Gate[]) => {
	if(prev.length !== next.length){
		return false;
	}else{
		return true;
	}
}

export default function MovableGates(){
	const movableGates = useSelector((state: RootState) => {return state.objectsSlice.gates;}, checkEquality);
	return <>
		{movableGates?.map((g) => {
			return <CustomGate gateProps={g} preview={false} key={g.id} position='absolute'></CustomGate>;
		})}
	</>;
}