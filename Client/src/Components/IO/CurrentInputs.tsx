import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { RootState } from '../../state/store';
import { keyboard } from '@testing-library/user-event/dist/keyboard';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { Input } from './Input';
import { Output } from './Output';
import { Root } from 'react-dom/client';

export const checkCurrentIoEq = (prev: BinaryIO[], next: BinaryIO[]) => {
	const prevEntries = Object.entries(prev);
	if(prevEntries.length !== Object.entries(next).length) return false;
	return true;
};

const CurrentIos =  React.memo(function CurrentInputs(){
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});
	const currentInputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => {
			if(io.gateId && io.gateId !== currentComponentId){
				return io;
			}else{
				return null;
			}
		}).filter((io): io is NonNullable<typeof io> => io !== null);
	}, checkCurrentIoEq);
    
	const memoizedIO = useMemo(() => {
		return currentInputs.map(io => {
			if(io.type === 'input'){
				if(io.name === 'test'){
					console.log(`rendering test at pos: ${io.position}`);
				}
				return <Input binaryInput={io} key={io.id}></Input>;
			}else{
				return <Output id={io.id} key={io.id}></Output>;
			}
		});
	}, [currentInputs]);

	return (
		<div style={{
			'--io-radius': `${ioRadius}px`,
			position: 'absolute',
			width: '100%',
			willChange: 'transform',
			height: '100%',
			pointerEvents: 'none',
			transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
		} as React.CSSProperties}>
			{memoizedIO}
		</div>);
});

export default CurrentIos;
