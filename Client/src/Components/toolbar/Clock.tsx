import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH } from '../../Constants/defaultDimensions';
import { RootState } from '../../state/store';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { buildPath, evaluateGates, globalSort, } from '../../utils/clock';
import { changeState, updateState } from '../../state/slices/entities';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { entities, Gate } from '@Shared/interfaces';
import { setError, setHertz, setIsRunning } from '../../state/slices/clock';
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR } from '../../Constants/colors';
import '../../index.css';
import { textStlye } from '../../Constants/commonStyles';
import { Button } from '@mui/material';
import DisplayError from './DisplayError';
export class CircularDependencyError extends Error{
	constructor(){
		super('Circular dependency');
		Object.setPrototypeOf(this, CircularDependencyError.prototype);
	}
}


export default function Clock() {
	const hertz = useSelector((state: RootState) => {return state.clock.hertz;});
	const gates = useSelector((state: RootState) => {return state.entities.gates;}, shallowEqual);
	const currentGates = useSelector((state: RootState) => {return state.entities.currentComponent.gates;}, shallowEqual);
	const io = useSelector((state: RootState) => {return state.entities.binaryIO;});
	const actualHertz = useSelector((state: RootState) => {return state.clock.actualHertz;});
	const actualRefreshRate = useSelector((state: RootState) => {return state.clock.actualRefreshRate;});
	const currentIo = useSelector((state:RootState) => {
		return state.entities.currentComponent.binaryIO;
	});
	const user = useSelector((state: RootState) => {return state.misc.user;});
	const misc = useSelector((state: RootState) => {return state.misc;});
	const actualEntities = useSelector((state: RootState) => {return state.entities;});
	const dispatch = useDispatch();
	// const entities = useSelector((state: RootState) => state.entities);
	const [value, setValue] = useState(`${hertz}`);
	const running = useSelector((state: RootState) => {return state.clock.isRunning;});
	const clockPhase = useSelector((state: RootState) => {return state.clock.clockPhase;});

	const handleHertzChange = (e:React.ChangeEvent<HTMLInputElement>) => {
		const number = parseInt(e.target.value);
	  	dispatch(setHertz(number));
		setValue(e.target.value);
	};

	const handleRunChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		dispatch(setIsRunning(!running));
	};

	const handleDownload = () => {
		const blob = new Blob([JSON.stringify(actualEntities)], { type: 'application/json' });
		const url = window.URL.createObjectURL(blob);
	  
		const link = document.createElement('a');
		link.href = url;
		link.download = 'data.json';  
		document.body.appendChild(link);
		link.click();
		
		document.body.removeChild(link);  
		window.URL.revokeObjectURL(url);  
	};

	const handleLoad = () => {
		fetch(`register.json`).then(res => {
			return res.json();
		}).then(data => {
			dispatch(changeState(data));
		}).catch(err => {
			console.error(`error: ${err.message}`);
		});
	};

	return <div style={{
		backgroundColor: DEFAULT_BACKGROUND_COLOR,
		width:'100%',
		maxHeight: '30%',
		borderStyle: 'solid',
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderColor: DEFAULT_BORDER_COLOR,
		borderRight: 'none',
		borderLeft: 'none',
		borderTop: 'none',
		padding: 10,
		marginTop: 10,
	}}>
		<span style={{
			fontSize: 22,
			color: 'white',
			position: 'relative',
			display: 'inline-block',
			left: '50%',
			transform: 'translateX(-50%)',
			marginBottom: 15,
			fontWeight: 'bold',
		}}>Clock</span>
		<div style={{ 
			display: 'flex', 
			alignItems: 'center',
			height: 30,
		 }}>
    	<label style={{color: 'white', marginLeft: 5, fontWeight: 600}}>
		Hz:
			</label>
			<input 
				type="number" 
				value={value}
				className='simple-input'
				onChange={handleHertzChange} 
				style={{ 
					marginLeft: '8px',
					height: '100%',
					fontSize: 18,
					width: '30%'
				}}
			/>
	  <div className='clickable-div simple-button' 
	  style={{
					fontSize: 18,
					display: 'flex',
					alignItems: 'center',
					padding: 5,
					paddingLeft: 10,
					height: '100%',
					paddingRight: 10,
					justifyContent: 'center',
					borderStyle: 'solid',
					borderRadius: 5,
					borderWidth: 1,
	  }}
	  onClick={handleRunChange}>
	  	<span style={{color: 'white', width: '100%', display: 'inline-block'}}>
		  {!clockPhase ? (running ? 'Stop' : 'Run') : `${clockPhase}...`}
				</span>
	  </div>
	  <div className='clickable-div'
	   style={{
					fontSize: 18,
					backgroundColor: 'rgb(40 40 40)',
					borderColor: 'rgb(80 80 80)',
					display: 'flex',
					alignItems: 'center',
					padding: 5,
					paddingLeft: 10,
					height: '100%',
					paddingRight: 10,
					justifyContent: 'center',
					borderStyle: 'solid',
					borderRadius: 5,
					borderWidth: 1,
				}} onClick={e => {
					try{
						const copiedGates = JSON.parse(JSON.stringify(gates));
						Object.entries(currentGates).forEach(([key, gate]) => {
							copiedGates[key] = JSON.parse(JSON.stringify(gate));
						});
						const copiedIo = JSON.parse(JSON.stringify(io));
						Object.entries(currentIo).forEach(([key, io]) => {
							copiedIo[key] = JSON.parse(JSON.stringify(io));
						});
						const {mainDag, SCCOrder} = globalSort(copiedGates, copiedIo);
					
						const order = [...mainDag, ...SCCOrder];

						evaluateGates(copiedGates, copiedIo, order);
						dispatch(updateState({gates: copiedGates, binaryIO: copiedIo}));
					}catch(err){
						if(err instanceof CircularDependencyError){
							dispatch(setError({isError: true, extraInfo: 'Circular dependency!'}));
						}else{
							console.error(err);
						}
					}
				
				}
				}><span style={{color: 'white', width: '100%', display: 'inline-block'}}>Tick</span></div>
		</div>
		<div style={{
			display: 'flex',
			flexDirection: 'column',
		}}>
			<span style={textStlye}>Actual hz: {actualHertz.toLocaleString('de-DE')}</span>
			<span style={textStlye}>Actual refresh rate: {actualRefreshRate}</span>
			{user === 'Superuser' && <button onClick={e => {
				const {user, ...miscBase} = misc;
				fetch(`http://localhost:3002/api/cpu`, {
					method: 'PUT',
					credentials: 'include',
					headers: {
						'Content-type': 'application/json',
					},
					body: JSON.stringify({...actualEntities, misc: miscBase})
				}).then(res => {
					if(!res.ok){
						console.error(`error saving cpu: ${res.status} ${res.statusText}`);
					}
					return res.json();
				}).then(data => {
					console.log(`got back data: ${data.message}`);
				});
			}}>save</button>}
			{user === 'Superuser' && <div>
				<button style={{width: 200, height: 50}} onClick={handleDownload}>Download</button>
			</div>}
			{user === 'Superuser' && <button onClick={handleLoad}>fetch json</button>}
		</div>
		 <div style={{ display: 'flex', alignItems: 'center' }}>
      
		</div>
	</div>;
}