import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './Input';
import { DEFAULT_INPUT_DIM, DEFAULT_INPUT_OFFSET_TOP, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Output } from './Output';
import { Gate } from '../Interfaces/Gate';
import { addGate, changeGate } from '../state/objectsSlice';
import { RootState } from '../state/store';
interface CustomGateProps{
    gateProps: Gate,
	preview: boolean,
	position?: 'absolute' | 'relative'
}

function CustomGate({gateProps, preview, position}:CustomGateProps){
	const eleRef = React.useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	

	const thisGate = useSelector((state: RootState) => {
		const i = state.objectsSlice.gates.findIndex(g => g.id === gateProps.id);
		if(i === -1){
			return;
		}
		return state.objectsSlice.gates[i];}, shallowEqual);
    
	const [{dx, dy}, setOffset] = useState({dx: 
		thisGate?.position ? thisGate.position.x : 0, 
	dy: thisGate?.position ? thisGate.position.y : 0});

	const [inputs, setInputs] = useState<BinaryInput[]>(gateProps.inputs);
	const outputs = gateProps.outputs;


	const setPositions = (x: number, y: number) => {
		
		//console.log(`gateProps.position changing: ${thisGate?.position?.x} ${thisGate?.position?.y}`);
		dispatch(changeGate({gate: gateProps, newPos: {x: x,y: y}}));
	};


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

	const handlePreviewMouseDown = () => {
		dispatch(addGate({...gateProps, id: crypto.randomUUID(), position: {
			x: eleRef.current?.getBoundingClientRect().x ? eleRef.current.getBoundingClientRect().x : 0, 
			y: eleRef.current?.getBoundingClientRect().y ? eleRef.current.getBoundingClientRect().y : 0
		}}));
	};

	return	(
		<>
		{/*console.log(`inside render: ${thisGate?.position?.y} ${thisGate?.position?.x} thisGate: ${thisGate} dx: ${dx} dy: ${dy}`)*/}
		{console.time('customGate')}
		<div ref={eleRef} 
			className='Gate-container' 
			style={{width: preview ? 3*MINIMAL_BLOCKSIZE : 4*MINIMAL_BLOCKSIZE, 
				height: calculateDivHeight(),
				position: position ? position : 'relative',
				top: thisGate?.position ? thisGate.position.y : 0,
				left: thisGate?.position ? thisGate.position.x : 0,
				borderTopRightRadius: 30,
				borderBottomRightRadius: 30,
				display: 'inline-block',
				justifySelf: 'center',
				backgroundColor: "rgb(100 100 100)"}} 
			id={gateProps.id}
			onMouseDown={e => {if(preview){ 
				e.stopPropagation(); 
				handlePreviewMouseDown();}
			else{
				handleMouseDown(e, eleRef, dispatch, dx, dy, setOffset, setPositions);
			}}}
		>
			{inputs.map((input, idx, array) => {
				return <Input binaryInput={{style: {top: calculateInputTop(idx, array)}, state: input.state, id: crypto.randomUUID()}} key={input.id}></Input>;
			})}
			<div style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}> 
				<span 
					className='Gate-container'
					key={gateProps.id}
					style={{color: 'white', cursor: "default", userSelect: 'none', fontSize: 22, fontWeight: 500}} 
					onMouseDown={e => { e.stopPropagation();
						preview ? handlePreviewMouseDown()
							: handleMouseDown(e, eleRef, dispatch, dx, dy, setOffset, setPositions);
					}}
				>{gateProps.name}</span>
			</div>
			{outputs.map((output, idx, array) => {
				return <Output style={{position: 'absolute', left:
                        (3*MINIMAL_BLOCKSIZE)-DEFAULT_INPUT_DIM.width/2,
				top:calculateInputTop(idx, array) }} state={0} id="1232" key={output.id}></Output>;
			})}
		</div>
		{console.timeEnd('customGate')}
		</>
	);
}
export {CustomGate};