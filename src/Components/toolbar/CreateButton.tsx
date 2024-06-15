import React from 'react';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';
import { useDispatch } from 'react-redux';

export default function CreateButton(){
	const dispatch = useDispatch();

	return <div style={{
		backgroundColor: 'rgb(200 200 200)',
		borderRadius: 30, 
		width: window.innerWidth - CANVAS_WIDTH, 
		height: 60, 
		position: 'absolute',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		left: CANVAS_WIDTH,
		top: 400}}
	onClick={e => {}}>
		<span style={{
			color: 'white',
			fontSize: 20,
			marginTop: -10,
			userSelect: 'none',
		}}>Create component</span>
	</div>;
}