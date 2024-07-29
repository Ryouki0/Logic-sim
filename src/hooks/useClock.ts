import React, { useEffect } from 'react';
import { Root } from 'react-dom/client';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { deepCopyComponent } from '../utils/deepCopyComponent';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { Gate } from '../Interfaces/Gate';

export default function useClock(){
	const gates = useSelector((state: RootState) => {return state.entities.gates;});
	const io = useSelector((state: RootState) => {return state.entities.binaryIO;});

	useEffect(() => {
       
		const copiedComponent = deepCopyComponent({gates: gates, io: io});

        
	}, [gates, io]);

   

    
}

