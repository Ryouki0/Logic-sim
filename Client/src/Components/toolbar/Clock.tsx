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
	const misc = useSelector((state: RootState) => {return state.misc});
	const actualEntities = useSelector((state: RootState) => {return state.entities;});
	const dispatch = useDispatch();
	// const entities = useSelector((state: RootState) => state.entities);
	const [value, setValue] = useState('100');
	const running = useSelector((state: RootState) => {return state.clock.isRunning;});
	const handleHertzChange = (e:React.ChangeEvent<HTMLInputElement>) => {
		const number = parseInt(e.target.value);
	  	dispatch(setHertz(number));
		setValue(e.target.value);
	};

	const handleRunChange = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
		<div style={{ display: 'flex', alignItems: 'center' }}>
    	<span style={textStlye}>
			Hz:
			</span>
			<input 
				type="number" 
				value={value}
				className='input-box'
				onChange={handleHertzChange} 
				style={{ 
					marginLeft: '8px',
					height: 26,
					fontSize: 18,
					width: 100
				}}
			/>
	  <button style={{
				fontSize: 18,
				height: 26
	  }}
	  onClick={handleRunChange}>
	  {running ? 'Stop' : 'Run'}</button>
	  <button style={{
				fontSize: 18,
				height: 26,
			}} onClick={e => {
				try{
					console.time('tick');
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
					console.timeEnd('tick');
				}catch(err){
					if(err instanceof CircularDependencyError){
						dispatch(setError({isError: true, extraInfo: 'Circular dependency!'}));
					}else{
						console.error(err);
					}
				}
				
			}
			}>Tick</button>
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
			{<div>
				<button style={{width: 200, height: 50}} onClick={handleDownload}>Download</button>
			</div>}
			<button onClick={handleLoad}>fetch json</button>
		</div>
		 <div style={{ display: 'flex', alignItems: 'center' }}>
      
		</div>
	</div>;
}