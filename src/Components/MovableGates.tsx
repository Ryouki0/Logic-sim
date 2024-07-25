import React from 'react';
import { Gate } from '../Interfaces/Gate';
import { CustomGate } from './CustomGate';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { current } from '@reduxjs/toolkit';

const checkEquality = (prev:{[key:string]:Gate}, next: {[key:string]:Gate}) => {
	if(Object.entries(prev).length !== Object.entries(next).length){
		return false;
	}else{
		return true;
	}
};

export default function MovableGates(){
	const currentGates = useSelector((state: RootState) => {return state.entities.currentComponent.gates}, checkEquality);
	return <>
		{Object.entries(currentGates)?.map(([key, gate]) => {
			return <CustomGate gateProps={gate} isBluePrint={false} key={gate.id} position='absolute'></CustomGate>;
		})}
	</>;
}