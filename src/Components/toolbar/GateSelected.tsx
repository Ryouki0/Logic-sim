
import React, { useEffect, useRef, useState } from 'react';
import { Gate } from '../../Interfaces/Gate';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import GatePreview from '../Preview/GatePreview';
import { MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import calculateGateHeight from '../../utils/calculateGateHeight';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { setGateDescription } from '../../state/slices/entities';
import { prependOnceListener } from 'process';
import { createSelector, current } from '@reduxjs/toolkit';
const checkGateEquality = (prev: Gate, next: Gate) => {
	if(prev?.nextTick !== next?.nextTick){
		return false;
	}
	if(prev?.id !== next?.id){
		return false;
	}
	if(prev?.description !== next?.description){
		return false;
	}
	return true;
}
export default function GateSelected({gate}: {gate: Gate}){

	const thisGate = useSelector((state: RootState) => {return state.entities.currentComponent.gates[gate.id]}, checkGateEquality);
	const gateChanged = useRef<boolean>(true);
	const currentText = useRef<string>('');
	const [text, setText] = useState<string>('');

	if(!gateChanged.current){
		gateChanged.current = true;
	}else{
		currentText.current = thisGate?.description ?? 'No description';
		setText('');
		gateChanged.current = false;
	}

	const gateHeight = calculateGateHeight(gate);
	
	const textareaRef = useRef<any>(null);
	
	
	const dispatch = useDispatch();
    useEffect(() => {
        if(textareaRef.current) {
            textareaRef.current!.style.height = 'auto';
            textareaRef.current!.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [thisGate, text]);

	const handleSave = (e: any) => {
		dispatch(setGateDescription({gateId: thisGate?.id, description: text}))
	}

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		gateChanged.current = false;
		currentText.current = e.target.value;
		setText(e.target.value);

	};

	return thisGate && <>
	<div style={{
		display: 'flex',
		marginLeft: 5,
		flexDirection: 'column',
	}}>
		<div style={{ 
			marginTop: MINIMAL_BLOCKSIZE, 
			height: gateHeight,
			marginLeft: -1.5*MINIMAL_BLOCKSIZE,
			alignSelf: 'center'
		}}>
        	<GatePreview thisGate={thisGate} verticalScale={1} />
    	</div>
	<div style={{
		display: 'flex', 
		flexDirection: 'column',
		marginTop: 10}}>
		<span style={{
			color: 'white',
			fontSize: 16,
			marginTop: 5
		}}>{thisGate?.id.slice(0,6)}</span>
		<span
			style={{
				color: 'white',
				fontSize: 16,
				marginTop: 5
			}}>{`\n`}parent: {thisGate?.parent.slice(0,6)}</span>
		<span style={{
			color: 'white',
			fontSize: 16,
			marginTop: 5,
		}}>Inputs: {thisGate?.inputs.map(inputId => inputId.slice(0,5)).join(' ')}</span>
		{thisGate?.nextTick != null && (
        <span
          style={{
            color: 'white',
            fontSize: 16,
            marginTop: 5,
          }}
        >
          NextTick: {thisGate?.nextTick}
        </span>)}
		<div style={{
			color: 'white',
			fontSize: 16,
			display: 'flex',
			alignItems: 'center',
			alignContent: 'center',
		}}>
      <label 
        htmlFor="description" 
        style={{ 
			marginRight: '10px',
			alignSelf: 'center',
			fontSize: 16}}
      >
        Description:
      </label>
      <textarea
		rows={1}
		spellCheck={false}
		ref={textareaRef}
		value={currentText.current}
		onChange={handleChange}
		style={{
			backgroundColor: 'transparent',
			color: 'white',
			fontSize: 16,
			border: 'none',
			outline: 'none',
			resize: 'none',
		}}
      />
	  {thisGate?.description !== currentText.current && (
		<button
		onClick={handleSave}
		style={{
			color: 'white',
			backgroundColor: '#28A745',
			border: 'none',
			height: 30,
			borderRadius: 5,
	  }}>Save</button>)}
    </div>
	</div>
	</div>

	</>
}