import React, { useEffect, useRef, useState } from 'react';
import { CANVAS_OFFSET_LEFT, CANVAS_WIDTH_MULTIPLIER, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Input } from './Input';
import { getClosestBlock } from '../drawingFunctions/getClosestBlock';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { addCurrentInput, changeInputState } from '../state/objectsSlice';
import {v4 as uuidv4} from 'uuid';
export default function CurrentInput(){
	const currentInputsRef = useRef<HTMLDivElement | null>(null);
	const inputs = useSelector((state: RootState) => {return state.objectsSlice.globalInputs;});
	const dispatch = useDispatch();
	const handleRightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.preventDefault();
		const {roundedX, roundedY} = getClosestBlock(e.pageX, e.pageY);
		dispatch(addCurrentInput({
			state: 0,
			id: uuidv4(),
			style: {top: roundedY - DEFAULT_INPUT_DIM.height/2}
		} as BinaryInput));
	};


	return <div id='current-inputs'
		style={{backgroundColor: 'rgb(80 80 80)', 
			width: 2*MINIMAL_BLOCKSIZE, 
			height: window.innerHeight * CANVAS_WIDTH_MULTIPLIER, 
			position: 'absolute',
			zIndex: 1,
			marginLeft: CANVAS_OFFSET_LEFT}}
		onContextMenu={handleRightClick}
		ref = {currentInputsRef}>
		{Object.entries(inputs).map(([key, input], idx) => {
			return (
				<div key={uuidv4()} style={{alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
					<Input binaryInput={{
						style: {top: input.style?.top, position: 'absolute', left: 2*MINIMAL_BLOCKSIZE - (DEFAULT_INPUT_DIM.width/2)}, 
						state: input.state,
						id: input.id}}
					></Input>
					<button style={{top: input.style?.top, marginTop:3,position: 'absolute',alignSelf:'center', borderRadius: 10, borderWidth: 0}} onClick={e => dispatch(changeInputState(input))}>ON</button>
				</div>
			);
		})}
	</div>;
}