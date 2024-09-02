import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH } from '../../Constants/defaultDimensions';
import { RootState } from '../../state/store';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { buildPath, evaluateGates, } from '../../utils/clock';
import { changeState, updateState } from '../../state/slices/entities';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { entities, Gate } from '@Shared/interfaces';
import { setHertz, setIsRunning } from '../../state/slices/clock';
import { DEFAULT_BORDER_COLOR } from '../../Constants/colors';
import '../../index.css';
import { textStlye } from '../../Constants/commonStyles';


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


	const totalComplexity = useMemo(() => {
		let total = 0;
		Object.entries(currentGates).forEach(([key, gate]) => {
			total += gate.complexity;
		});
		return total;
	}, [currentGates]);

	return <div style={{
		backgroundColor: 'rgb(100 100 100)',
		width:'100%',
		maxHeight: '30%',
		borderStyle: 'solid',
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderColor: DEFAULT_BORDER_COLOR,
		borderRight: 'none',
		borderLeft: 'none',
		borderTop: 'none',
		padding: 10,
		flex: '1 1',
		marginTop: 10,
	}}>
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
				console.time('tick');
				const copiedGates = JSON.parse(JSON.stringify(gates));
				Object.entries(currentGates).forEach(([key, gate]) => {
					copiedGates[key] = JSON.parse(JSON.stringify(gate));
				});
				const copiedIo = JSON.parse(JSON.stringify(io));
				Object.entries(currentIo).forEach(([key, io]) => {
					copiedIo[key] = JSON.parse(JSON.stringify(io));
				});
				
				const order = buildPath(copiedGates, copiedIo);
				evaluateGates(copiedGates, copiedIo, order);
				dispatch(updateState({gates: copiedGates, binaryIO: copiedIo}));
				console.timeEnd('tick');
			}
			}>Tick</button>
		</div>
		<div style={{
			display: 'flex',
			flexDirection: 'column',
		}}>
			<span style={textStlye}>Actual hz: {actualHertz.toLocaleString('de-DE')}</span>
			<span style={textStlye}>Actual refresh rate: {actualRefreshRate}</span>
			<span style={textStlye}>Total complexity: {totalComplexity}</span>
			<button onClick={e => {fetch(`https://reacttest-5vuh.onrender.com/api/cpu`, {
				method: 'PUT',
				credentials: 'include',
				headers: {
					'Content-type': 'application/json',
				},
				body: JSON.stringify(actualEntities)
			}).then(res => {
				if(!res.ok){
					console.error(`error saving cpu: ${res.status} ${res.statusText}`);
				}

				return res.json();
			}).then(data => {
				console.log(`got back data: ${data.message}`);
			});
			}}>save</button>
			
			
		</div>
		{/* <button onClick={e => {
			fetch('https://reacttest-5vuh.onrender.com/api/saveData', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json'
				},
				body: JSON.stringify(entities)
			})
		}}>
			SAVE ENTITIES
		</button>
		<button onClick={e => {
			fetch('https://reacttest-5vuh.onrender.com/api/commonEntities', {
				method: 'GET'
			}).then(res => res.json()).then(data => {
				dispatch(changeState(data as entities));
			})
		}}>
			LOAD COMMON ENTITIES
		</button> */}
		 <div style={{ display: 'flex', alignItems: 'center' }}>
      
		</div>
	</div>;
}