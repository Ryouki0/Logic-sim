
import React from 'react';
import { Gate } from '../../Interfaces/Gate';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import GatePreview from '../Preview/GatePreview';
import { MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import calculateGateHeight from '../../utils/calculateGateHeight';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { isNestedFrozen } from '@reduxjs/toolkit/dist/serializableStateInvariantMiddleware';

const checkGateEquality = (prev: Gate, next: Gate) => {
	if(prev.nextTick !== next?.nextTick){
		return false;
	}
	return true;
}
export default function GateSelected({gate}: {gate: Gate}){
	const thisGate = useSelector((state: RootState) => {return state.entities.currentComponent.gates[gate.id]}, checkGateEquality);
	const gateHeight = calculateGateHeight(gate);

	return gate && <>
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
		  
	</div>
	</div>

	</>
}