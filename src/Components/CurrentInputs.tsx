import React, { useEffect, useRef, useState } from 'react';
import { CANVAS_OFFSET_LEFT, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Input } from './Input';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { addCurrentInput, changeInputState } from '../state/objectsSlice';
import {v4 as uuidv4} from 'uuid';
export default function CurrentInput(){
	const currentInputsRef = useRef<HTMLDivElement | null>(null);
	const inputs = useSelector((state: RootState) => {return state.objectsSlice.currentInputs;});
	const inputPositions = useRef<[{x:number, y: number}] | []>([]);
	const dispatch = useDispatch();
	const handleRightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.preventDefault();
		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
		dispatch(addCurrentInput({
			state: 0,
			id: uuidv4(),
			style: {top: roundedY - DEFAULT_INPUT_DIM.height/2}
		} as BinaryInput));
	}


	return <div id='current-inputs'
		style={{backgroundColor: 'rgb(80 80 80)', 
			width: MINIMAL_BLOCKSIZE, 
			height: '80%', 
			position: 'absolute',
			zIndex: 1,
			marginLeft: CANVAS_OFFSET_LEFT}}
			onContextMenu={handleRightClick}
		ref = {currentInputsRef}>
		{inputs?.map((input, idx) => {
			return <Input binaryInput={{
				style: {top: input.style?.top, position: 'absolute'}, 
				state: input.state, 
				id: input.id}}
				onClick={(e:React.MouseEvent<HTMLDivElement, MouseEvent>) => {
					console.log('called rightClick');
					e.stopPropagation();
					e.preventDefault();
					dispatch(changeInputState(input));
				}}
				key={uuidv4()}></Input>;
		})}
	</div>;
}