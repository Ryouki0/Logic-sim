import React, { useMemo } from 'react';
import { Gate } from '@Shared/interfaces';
import { CustomGate } from './CustomGate';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { current } from '@reduxjs/toolkit';

const checkEquality = (prev:{[key:string]:Gate}, next: {[key:string]:Gate}) => {
	
	const prevEntries = Object.entries(prev);
	if(Object.entries(prev).length !== Object.entries(next).length){
		return false;
	}
	if(prevEntries?.[0]?.[1]?.parent !== next[prevEntries?.[0]?.[0]]?.parent){
		return false;
	}
	return true;
};

export default function MovableGates(){
	const currentGates = useSelector((state: RootState) => {return state.entities.currentComponent.gates;}, checkEquality);
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});

	const memoizedGates = useMemo(() => {
		return Object.entries(currentGates)?.map(([key, gate]) => {
			return <CustomGate gateId={key} isBluePrint={false} key={gate.id} position='absolute'></CustomGate>;
		});
	}, [currentGates]);

	return <>
		<div style={{
			'--block-size': `${blockSize}px`,
			position: 'absolute', 
			width: '100%', 
			height: '100%', 
			transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`, 
			pointerEvents: 'none',
			willChange: 'transform'} as React.CSSProperties}>
			{memoizedGates}
		</div>
		
	</>;
}