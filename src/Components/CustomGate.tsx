import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './Input';
import { DEFAULT_INPUT_DIM, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Output } from './Output';
import { Gate } from '../Interfaces/Gate';
import { addGate, changeGate, changeInputPosition, removeGate } from '../state/objectsSlice';
import { RootState } from '../state/store';
import {v4 as uuidv4} from 'uuid';
import './../gate.css';
import { calculateInputTop } from '../utils/calculateInputTop';
interface CustomGateProps{
    gateProps: Gate,
	preview: boolean,
	position?: 'absolute' | 'relative'
}

function checkGateEquality(prev: Gate, next: Gate){
	if(!prev || !next){
		return true;
	}
	//console.log(`render?: ${!(prev.position?.x === next.position?.x && prev.position?.y === next.position?.y)}`);
	
	return prev.position?.x === next.position?.x && prev.position?.y === next.position?.y;
}

function CustomGate({gateProps, preview, position}:CustomGateProps){
	const eleRef = React.useRef<HTMLDivElement>(null);
	const dispatch = useDispatch();
	
	const thisGate = useSelector((state: RootState) => {
		const i = state.objectsSlice.gates.findIndex(g => g.id === gateProps.id);
		return state.objectsSlice.gates[i];}, checkGateEquality);
    
	const offsetRef = useRef({dx: 
		thisGate?.position ? thisGate.position.x : 0, 
	dy: thisGate?.position ? thisGate.position.y : 0});

	const setOffset = (dx:number, dy:number) => {
		offsetRef.current = {...offsetRef.current, dx: dx, dy: dy};
	}

	const [inputs, setInputs] = useState<BinaryInput[]>(gateProps.inputs);
	const outputs = gateProps.outputs;

	useEffect(() => {
		if(!thisGate?.position){
			return;
		}
		const lastPosX = thisGate.position?.x;
		const lastPosY = thisGate.position?.y;
		//console.log(`lastX: ${lastPosX} lastY: ${lastPosY}`);
	  }, [thisGate?.position]);

	function setPositions(x: number, y: number){
		//console.log(`gateProps.position changing: ${thisGate?.position?.x} ${thisGate?.position?.y}`);
		dispatch(changeInputPosition({x: x,y:y, gateId: thisGate.id}));
		dispatch(changeGate({gate: thisGate, newPos: {x: x,y: y}}));
	};

	
	const calculateDivHeight = () => {
		if(inputs.length <= 1 && outputs.length <= 1){
			return 2*MINIMAL_BLOCKSIZE + LINE_WIDTH;
		}
		return inputs.length % 2 === 0 ? (inputs.length * MINIMAL_BLOCKSIZE) + LINE_WIDTH : ((inputs.length-1) * MINIMAL_BLOCKSIZE) +LINE_WIDTH;
	};


	const handlePreviewMouseDown = () => {
		dispatch(addGate({...gateProps, id: uuidv4(), position: {
			x: eleRef.current?.getBoundingClientRect().x ? eleRef.current.getBoundingClientRect().x : 0, 
			y: eleRef.current?.getBoundingClientRect().y ? eleRef.current.getBoundingClientRect().y : 0
		}}));
		console.log('created gate');
	};

	return	(
		<>
		{/*console.log('RENDER CUSTOMGATE ')*/}
		<div ref={eleRef} 
			className='Gate-container'
			style={{width: 3*MINIMAL_BLOCKSIZE, 
				height: calculateDivHeight(),
				position: position ? position : 'relative',
				top: thisGate?.position ? thisGate.position.y : 0,
				left: thisGate?.position ? thisGate.position.x : 0,
				borderTopRightRadius: 30,
				borderBottomRightRadius: 30,
				display: 'inline-block',
				justifySelf: 'center',
				cursor: 'pointer',
				backgroundColor: "rgb(100 100 100)"}} 
			id={gateProps.id}
			onContextMenu={e => {e.stopPropagation(); e.preventDefault();dispatch(removeGate(gateProps.id))}}
			onMouseEnter={e => {if(preview){
				e.stopPropagation(); 
				handlePreviewMouseDown();
			}}}
			
			//onMouseOver={handleMouseOver}
			
			onMouseDown={e => {if(preview){ }
			else{
				handleMouseDown(e, eleRef, dispatch, offsetRef.current.dx, offsetRef.current.dy, setOffset, setPositions);
			}}}
		>
			{inputs.map((input, idx, array) => {
				return <Input binaryInput={{style: {
					top: calculateInputTop(idx, array),
					cursor: 'default'},
					state: input.state, id: input.id}} gateId={gateProps.id} key={input.id}></Input>;
			})}
			<div style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}> 
				<span
					key={gateProps.id}
					style={{color: 'white', cursor: "drag", userSelect: 'none', fontSize: 22, fontWeight: 500}} 
					onMouseDown={e => { e.stopPropagation();
						preview ? handlePreviewMouseDown()
							: handleMouseDown(e, eleRef, dispatch, offsetRef.current.dx, offsetRef.current.dy, setOffset, setPositions);
					}}
				>{gateProps.name}</span>
			</div>
			{outputs.map((output, idx, array) => {
				return <Output style={{position: 'absolute', left:
                        (3*MINIMAL_BLOCKSIZE)-DEFAULT_INPUT_DIM.width/2,
				top:calculateInputTop(idx, array),
				cursor: 'default'}} state={0} id="1232" key={output.id}></Output>;
			})}
		</div>
		</>
	);
}
export {CustomGate};