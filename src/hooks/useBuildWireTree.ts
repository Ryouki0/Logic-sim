import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

export default function useBuildWireTree(){
    const wires = useSelector((state:RootState) => {return state.objectsSlice.wires});
    const buildWireTree = (from: string) => {
        
    }  
    return buildWireTree; 
}