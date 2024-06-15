import React from 'react';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';
import { RootState } from '../../state/store';
import { useSelector } from 'react-redux';

export default function Clock() {
	const hertz = useSelector((state: RootState) => {return state.clock.hertz;});
	return <div style={{
		position:'absolute',
		left: CANVAS_WIDTH,
		top: 300,
		backgroundColor: 'rgb(100 100 100)',
		width: window.innerWidth-CANVAS_WIDTH,
		height: 400,
	}}>
		<input style={{marginTop: 10, fontSize: 18, color: 'black'}} value={`Hz: ${hertz}`}></input>
	</div>;
}