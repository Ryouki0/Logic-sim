import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Input } from './Input';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { addCurrentInput } from '../state/objectsSlice';

export default function CurrentInput(){
	const currentInputsRef = useRef<HTMLDivElement | null>(null);
	const inputs = useSelector((state: RootState) => {return state.objectsSlice.currentInputs;});
	const dispatch = useDispatch();
	useEffect(() => {
		if(!currentInputsRef){
			return;
		}
		const handleRightClick = (e: MouseEvent) => {
			e.preventDefault();
			const {roundedX, roundedY} = getClosestBlock(e.clientX, e.clientY);
			dispatch(addCurrentInput({
				state: 0,
				id: crypto.randomUUID(),
				style: {top: roundedY - DEFAULT_INPUT_DIM.height/2}
			} as BinaryInput));
		};
		currentInputsRef.current?.addEventListener('contextmenu', handleRightClick);
		return () => {
			currentInputsRef.current?.removeEventListener('contextmenu', handleRightClick);
		};
	}, []);
	return <div id='current-inputs'
		style={{backgroundColor: 'rgb(40 40 40 / 30%)', 
			width: MINIMAL_BLOCKSIZE, 
			height: '80%', 
			position: 'absolute', 
			marginLeft: MINIMAL_BLOCKSIZE}}
		ref = {currentInputsRef}>
		{inputs?.map((input, idx) => {
			return <Input binaryInput={{
				style: {top: input.style?.top, position: 'absolute'}, 
				state: input.state, 
				id: crypto.randomUUID()}}
			key={crypto.randomUUID()}></Input>;
		})}
	</div>;
}