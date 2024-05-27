// import React, { useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../state/store';
// import { changeGateOutputState } from '../state/objectsSlice';
// import { Gate } from '../Interfaces/Gate';
// import { BinaryInput } from '../Interfaces/BinaryInput';
export {};
// const checkGateInputStatesEquality = (prev:Gate[], next:Gate[]) => {
// 	if(prev.length !== next.length){
// 		return false;
// 	}
// 	let a = true;
// 	for(var i = 0; i<prev.length;i++){
// 		prev[i].inputs.forEach((input, idx) => {
// 			if(next[i].inputs[idx].from?.state !== input.from?.state){
// 				console.log('input changed');
// 				a = false;
// 			}
// 		});
// 	}
// 	return a;
// };

// export default function useClock(){
// 	// //const gates = useSelector((state:RootState) => {return null});
// 	// useEffect(() => {
// 	// 	const id = setInterval(() => {
// 	// 		gates.forEach(gate => {
// 	// 			if (gate.name === 'AND' || gate.name === 'NO') {
// 	// 				//console.log(`${gate.inputs[0].from?.state}`);
// 	// 			}
// 	// 		});
// 	// 	}, 1000);

// 	// 	return () => {
// 	// 		clearInterval(id);
// 	// 	};
// 	// }, [gates]);
    
// }