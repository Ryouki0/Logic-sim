
import React from 'react';
import { Gate } from '../../Interfaces/Gate';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { BinaryIO } from '../../Interfaces/BinaryIO';

const checkInputEquality = (prev: BinaryIO[], next: BinaryIO[]) => {
    
}
export default function GateSelected({gate}: {gate: Gate}){
    // const inputs = useSelector((state: RootState) => {
    //     return gate.inputs.map(inputId => state.entities.binaryIO[inputId]);
    // })
    return <div>
        <span style={{
            color: 'white',
            fontSize: 16,
        }}>{gate.id.slice(0,6)}</span>
        <span
        style={{
            color: 'white',
            fontSize: 16,
        }}>{`\n`}parent: {gate.parent.slice(0,6)}</span>
        <span style={{
            color: 'white',
            fontSize: 16,
        }}>Inputs: {gate.inputs.map(inputId => inputId.slice(0,5)).join(' ')}</span>
    </div>;
}