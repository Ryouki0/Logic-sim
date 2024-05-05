import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './Input';
import { DEFAULT_INPUT_DIM, DEFAULT_INPUT_OFFSET_TOP, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Output } from './Output';
import { Gate } from '../Interfaces/Gate';

interface CustomGateProps{
    gateProps: Gate,
	preview: boolean,
}

function CustomGate({gateProps, preview}:CustomGateProps){
	const eleRef = React.useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	const [{dx, dy}, setOffset] = useState({dx: 0, dy: 0});
	const [{x,y}, setPosition] = useState({x: 0, y:0});
    
	const inputs: BinaryInput[] = gateProps.inputs;
	const outputs = gateProps.outputs;

	const calculateDivHeight = () => {
		if(inputs.length <= 1 && outputs.length <= 1){
			return 2*MINIMAL_BLOCKSIZE + LINE_WIDTH;
		}
		return inputs.length % 2 === 0 ? (inputs.length * MINIMAL_BLOCKSIZE) + LINE_WIDTH : ((inputs.length-1) * MINIMAL_BLOCKSIZE) +LINE_WIDTH;
	};

	const calculateInputTop = (idx: number, array: BinaryInput[]) => {
		if(array.length == 1){
			return MINIMAL_BLOCKSIZE -DEFAULT_INPUT_DIM.height/2;
		}
		const defaultExpression = -((DEFAULT_INPUT_DIM.height/2)) + (idx*(MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height));
		if(array.length % 2 === 0){
			if(idx >= (array.length / 2)){
				return -((DEFAULT_INPUT_DIM.height/2)) + ((idx+1)*(MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height)) + DEFAULT_INPUT_DIM.height;
			}
		}
		return defaultExpression; 
	};

	return (
		<>
			<div ref={eleRef} 
				className='Gate-container' 
				style={{width: 3*MINIMAL_BLOCKSIZE, 
					height: calculateDivHeight(),
					position: 'relative',
					top: y,
					left: x,
					borderTopRightRadius: 30,
					borderBottomRightRadius: 30,
					display: 'inline-block',
					justifySelf: 'center',
					backgroundColor: "rgb(100 100 100)"}} 
				id={gateProps.id}
				key={gateProps.id}
				onMouseDown={e => handleMouseDown(e, eleRef, dispatch, dx, dy, setOffset, setPosition)}
			>
				{inputs.map((input, idx, array) => {
					return (
						<Input binaryInput={{style: {top: calculateInputTop(idx, array)}, state: input.state, id: crypto.randomUUID()}}></Input>);
				})}
				<div style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}> 
					<span 
						className='Gate-container' 
						style={{color: 'red', cursor: "default", userSelect: 'none', fontSize: 20, fontWeight: 500}} 
						onMouseDown={e => {
							handleMouseDown(e, eleRef, dispatch, dx, dy, setOffset, setPosition);
						}}
					>{gateProps.name}</span>
				</div>
				{outputs.map((output, idx, array) => {
					return <>
						<Output style={{position: 'absolute', left:
                        (3*MINIMAL_BLOCKSIZE)-DEFAULT_INPUT_DIM.width/2,
						top:calculateInputTop(idx, array) }} state={0} id="1232" key={idx}></Output>
					</>;
				})}
                
			</div>
		</>
	);
}
export {CustomGate};