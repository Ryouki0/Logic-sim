
import React from 'react';
import { Gate } from '../../Interfaces/Gate';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { BinaryIO } from '../../Interfaces/BinaryIO';

const checkInputEquality = (prev: BinaryIO[], next: BinaryIO[]) => {
    
}
export default function GateSelected({gate}: {gate: Gate}){
    const inputs = useSelector((state: RootState) => {
        return gate.inputs.map(inputId => state.entities.binaryIO[inputId]);
    })
    return null;
}