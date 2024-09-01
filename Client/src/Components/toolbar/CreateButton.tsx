import React, { useEffect, useRef, useState } from 'react';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { createBluePrint } from '../../state/slices/entities';
import '../../index.css';
import { RootState } from '../../state/store';
import { setIsRunning } from '../../state/slices/clock';
import { textStlye } from '../../Constants/commonStyles';
import { createSelector } from '@reduxjs/toolkit';
import { Gate } from '@Shared/interfaces';
export default function CreateButton(){
	const dispatch = useDispatch();
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const [name, setName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

	const selectGates = (state: RootState) => state.entities.bluePrints.gates;

	const bluePrintsSelector = createSelector(
  		[selectGates],
  		(gates) => {
    	const topLevelComponents: { [key: string]: Gate } = {};
    	Object.entries(gates).forEach(([key, gate]) => {
      	if(gate.parent === 'global') {
        	topLevelComponents[key] = gate;
      	}
			});
			return topLevelComponents;
		}
	);
	const bluePrints = useSelector(bluePrintsSelector);
	useEffect(() => {
		if(textAreaRef.current) {
            textAreaRef.current!.style.height = 'auto';
            textAreaRef.current!.style.height = `${textAreaRef.current.scrollHeight}px`;
		}
	}, [description]);

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(e.target.value);
	};

	const handleCreateComponent = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		if(currentComponentId !== 'global' || e.button !== 0) return;
		for(const [key, gate] of Object.entries(bluePrints)){
			
		}
		dispatch(setIsRunning(false));
		dispatch(createBluePrint({name: name, description: description}));
	};

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
			alignItems: 'center'
		}}>
			<input 
				className='input-box'
				style={{
					width: '50%',
					marginLeft: 10,
					marginBottom: 0,
					height: 24,
					fontSize: 18,
					color: 'black'}}
				onChange={e => {setName(e.target.value);}} 
				value={name}
				placeholder='Component name'></input>
		</div>
		<div style={{
			display: 'flex',
			alignItems: 'center',
			marginBottom: 20,
			marginTop: 10,
		}}>
			<label 
				htmlFor="description" 
				style={{...textStlye, marginLeft: 10, marginTop: 0}}
			>
        			Description:
			</label>
			<textarea
				rows={1}
				spellCheck={false}
				ref={textAreaRef}
				value={description}
				onChange={handleDescriptionChange}
				style={{
					backgroundColor: 'transparent',
					color: 'white',
					fontSize: 17,
					border: 'none',
					alignSelf: 'center',
					outline: 'none',
					resize: 'none',
				}}
			/>
		</div>
		<div style={{
			minWidth: '30%',
			maxWidth: '70%',
			justifyContent: 'center',
			marginLeft: 10,
			backgroundColor: '#28A745',
			opacity: currentComponentId !== 'global' ? 0.5 : 1,
			height: 60,
			position: 'relative',
			boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
			borderRadius: 20,
			cursor: currentComponentId !== 'global' ? 'not-allowed': 'pointer',
			display: 'flex',
			transition: 'all 0.3s ease'
		}}
		onClick={handleCreateComponent}
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
				fontWeight: 500,
				justifySelf: 'center',
				alignSelf: 'center',
				userSelect: 'none',
			}}>➕ Create component</span>
		</div>
		
	</div>;
}