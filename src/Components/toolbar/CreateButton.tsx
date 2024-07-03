import React, { useState } from 'react';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';
import { useDispatch } from 'react-redux';
import { createBluePrint } from '../../state/slices/entities';

export default function CreateButton(){
	const dispatch = useDispatch();
	const [name, setName] = useState<string>('');
	return <div style={{
		height: '30%',
		display: 'flex',
		flexDirection: 'column',
		width: window.innerWidth - CANVAS_WIDTH,
		top: '60%',
	}} onClick={e=>{console.log(``)}}>
		<div style={{
			width: '100%',
			height: 50,
		}}>
			<input style={{
				width: '50%', 
				height: 20,
				fontSize: 18,
				color: 'black'}}
			onChange={e => {setName(e.target.value)}} 
			value={name}
			placeholder='Component name'></input>
		</div>
		<div style={{
			width: '50%',
			justifyContent: 'center',
			backgroundColor: '#28A745',
			height: 60,
			position: 'relative',
			alignSelf: 'center',
			boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
			borderRadius: 20,
			cursor: 'pointer',
			display: 'flex',
			transition: 'all 0.3s ease'
		}}
		onClick={e => {dispatch(createBluePrint({name: name}))}}
		onMouseEnter={e=>{
			e.currentTarget.style.backgroundColor = '#218838';
			e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
		}}
		onMouseLeave={e => {
			e.currentTarget.style.backgroundColor = '#28A745';
       		e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
		}}>
			<span style={{
				fontSize: 20,
				marginTop: -8,
				color: 'white',
				justifySelf: 'center',
				alignSelf: 'center',
				userSelect: 'none',
			}}>Create component</span>
		</div>
		
	</div>
}