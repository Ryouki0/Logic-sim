import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH } from '../../Constants/defaultDimensions';
import { useDispatch, useSelector } from 'react-redux';
import { createBluePrint, recalculatePositions } from '../../state/slices/entities';
import '../../index.css';
import { RootState } from '../../state/store';
import { setIsRunning } from '../../state/slices/clock';
import { textStlye } from '../../Constants/commonStyles';
import { createSelector } from '@reduxjs/toolkit';
import { Gate } from '@Shared/interfaces';
import { DEFAULT_BORDER_COLOR } from '../../Constants/colors';
import { changeBlockSize } from '../../state/slices/misc';
export default function CreateButton(){
	const dispatch = useDispatch();
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const [name, setName] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [localError, setLocalError] = useState<string | null>(null);
	const [hasBlockSizeUpdated, setHasBlockSizeUpdated] = useState(false);
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const currentGates = useSelector((state: RootState) => {return state.entities.currentComponent.gates;});
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize});
	const prevSize = useRef(blockSize);
	const shouldSizeChange = useRef(false);
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

	const totalComplexity = useMemo(() => {
		let total = 0;
		Object.entries(currentGates).forEach(([key, gate]) => {
			total += gate.complexity;
		});
		return total;
	}, [currentGates]);

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
			if(gate.name === name){
				setLocalError('Names must be unique');
				return;
			}
		}
		setName('');
		setDescription('');
		dispatch(setIsRunning(false));
		dispatch(createBluePrint({name: name, description: description, blockSize: blockSize}));
	};

	return <div style={{
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		maxHeight: '30%',
	}}>
		<span style={{
			fontSize: 22,
			color: 'white',
			marginBottom: 15,
			fontWeight: 'bold',
			alignSelf: 'center',
			marginTop: 15,
		}}>Component</span>
		{localError && <span style={{...textStlye, marginLeft:10,
			backgroundColor: 'red',
			width: '50%',
			padding: 5,
			opacity: 0.8}}>{localError}</span>}

		<div style={{
			width: '100%',
			height: 50,
			display:'flex',
			alignItems: 'center'
		}}>
			<label style={{...textStlye, marginLeft: 10, marginTop: 0}}>
				Component name: 
			</label>
			<input 
				className='simple-input'				
				onChange={e => {setName(e.target.value); setLocalError(null);}} 
				value={name}></input>
		</div>
		<div style={{
			display: 'flex',
			alignItems: 'center',
		}}>
			<label 
				htmlFor="description" 
				style={{...textStlye, marginLeft: 10, marginTop: 0}}
			>
        			Description:
			</label>
			<textarea
				rows={1}
				className='simple-input'
				spellCheck={false}
				ref={textAreaRef}
				value={description}
				onChange={handleDescriptionChange}
				style={{
					color: 'white',
					overflow: 'hidden',
					alignSelf: 'center',
					resize: 'none',
				}}
			/>

		</div>
		<span style={{...textStlye, marginLeft: 10, marginBottom: 20}}>Total complexity: {totalComplexity}</span>


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
			left: '50%',
    		transform: 'translate(-50%)',
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
				top: '50%',
			}}>➕ Create component</span>
		</div>
		<div style={{width: '100%', height: DEFAULT_BORDER_WIDTH, backgroundColor: DEFAULT_BORDER_COLOR, marginTop: 10}}></div>
		
	</div>;
}