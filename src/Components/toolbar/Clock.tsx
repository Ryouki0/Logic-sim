import React, { useEffect } from 'react';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';
import { RootState } from '../../state/store';
import { useDispatch, useSelector } from 'react-redux';
import { logic } from '../../utils/clock';
import { updateState } from '../../state/slices/entities';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { Gate } from '../../Interfaces/Gate';


const checkIoEquality = (prev: {[key:string]:BinaryIO}, next: {[key: string] : BinaryIO}) => {
	const prevEntries = Object.entries(prev);
	const nextEntries = Object.entries(next);
	if(prevEntries.length !== nextEntries.length){
		return false;
	}
	for(const [key, io] of prevEntries){
		if(io.state !== next[key].state){
			return false;
		}if(io.from?.id !== next[key]?.from?.id){
			return false;
		}
	}
	return true;
}
export default function Clock() {
	const hertz = useSelector((state: RootState) => {return state.clock.hertz;});
	const gates = useSelector((state: RootState) => {return state.entities.gates});
	const io = useSelector((state: RootState) => {return state.entities.binaryIO}, checkIoEquality);
	const dispatch = useDispatch();
	useEffect(() => {
		
	}, [gates, io])

	return <div style={{
		top: 300,
		backgroundColor: 'rgb(100 100 100)',
		width: window.innerWidth-CANVAS_WIDTH,
		height: 400,
	}}>
		<input style={{marginTop: 10, fontSize: 18, color: 'black', width: '90%'}} value={`Hz: ${hertz}`}></input>
		<button style={{marginTop: 10, fontSize: 18}} onClick={e => {
			const newState = logic({gates:gates,io: io, level: 'global'});
			dispatch(updateState({gates: newState.gates, binaryIO: newState.io}));
		}
		}>Tick</button>
	</div>;
}