import React, { useState } from 'react';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { createBluePrint } from '../../state/slices/entities';
import '../../index.css';
import { RootState } from '../../state/store';
export default function CreateButton(){
	const dispatch = useDispatch();
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId});
	const [name, setName] = useState<string>('');
	return <div style={{
		display: 'flex',
		flexDirection: 'column',
		flex: '1 1',
		width: '100%',
	}}>
		<div style={{
			width: '100%',
			height: 50,
			display:'flex',
			justifyContent: 'center',
			alignItems: 'center',
		}}>
			<input 
			className='input-box'
			style={{
				width: '50%', 
				alignSelf: 'center',
				height: 24,
				justifySelf:'center',
				fontSize: 18,
				color: 'black'}}
			onChange={e => {setName(e.target.value);}} 
			value={name}
			placeholder='Component name'></input>
		</div>
		<div style={{
			width: '50%',
			justifyContent: 'center',
			backgroundColor: '#28A745',
			opacity: currentComponentId !== 'global' ? 0.5 : 1,
			height: 60,
			position: 'relative',
			alignSelf: 'center',
			boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
			borderRadius: 20,
			cursor: currentComponentId !== 'global' ? 'not-allowed': 'pointer',
			display: 'flex',
			transition: 'all 0.3s ease'
		}}
		onClick={e => {
			if(currentComponentId !== 'global' || e.button !== 0) return;
			dispatch(createBluePrint({name: name}));}}
		onMouseEnter={e=>{
			if(currentComponentId !== 'global') return;
			e.currentTarget.style.backgroundColor = '#218838';
			e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
		}}
		onMouseLeave={e => {
			if(currentComponentId !== 'global') return;
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
		
	</div>;
}