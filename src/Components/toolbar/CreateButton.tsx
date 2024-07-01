import React, { useState } from 'react';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';
import { useDispatch } from 'react-redux';
import { createBluePrint } from '../../state/slices/entities';

export default function CreateButton(){
	const dispatch = useDispatch();
	const [name, setName] = useState<string>('');
	return <div style={{
		position: 'absolute',
		left: CANVAS_WIDTH,
		height: 300,
		width: window.innerHeight - CANVAS_WIDTH,
		backgroundColor: 'red',
		top: 300,
	}}>
		<div style={{
			backgroundColor: 'blue',
			width: 200,
			height: 50,
		}}>

		</div>
	</div>
}