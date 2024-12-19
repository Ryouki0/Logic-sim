import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import CurrentIos from './CurrentInputs';

export default function AllIOParent(){
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	return (
		<div style={{
			'--camera-offsetX': `${cameraOffset.x}px`,
			'--camera-offsetY': `${cameraOffset.y}px`,
			width: '100%',
			height: '100%',
			position: 'absolute',
			pointerEvents: 'none',
			willChange: 'transform',
		} as React.CSSProperties}>
			<CurrentIos></CurrentIos>
		</div>
	);
}