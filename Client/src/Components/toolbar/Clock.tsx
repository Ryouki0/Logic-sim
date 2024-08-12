import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH } from '../../Constants/defaultDimensions';
import { RootState } from '../../state/store';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { logic } from '../../utils/clock';
import { updateState } from '../../state/slices/entities';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { Gate } from '@Shared/interfaces';
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
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const currentIo = useSelector((state:RootState) => {
		return state.entities.currentComponent.binaryIO;
	});
	const dispatch = useDispatch();
	
	const [value, setValue] = useState('100');
	const running = useSelector((state: RootState) => {return state.clock.isRunning});
	const [description, setDescription] = useState<string>('');
	const handleHertzChange = (e:React.ChangeEvent<HTMLInputElement>) => {
		const number = parseInt(e.target.value);
	  	dispatch(setHertz(number));
		setValue(e.target.value);
	};

	const handleRunChange = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		dispatch(setIsRunning(!running));
	};

	const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(e.target.value);
	}
	const [testCall, setTestCall] = useState<{x: number, y: number}>({x:0,y:0});
	useEffect(() => {
		async function hello(){
			try{
				let res = await fetch("http://localhost:3002/api/ayaya");
				let data = await res.json();
				setTestCall({x:data.message.x, y: data.message.y});
			}catch(e){
				console.log(`failed to fech ${e}`);
			}
			
		}
		hello();
	}, [])

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
		height: '30%',
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
				copiedGates[key] = gate;
			});
			const copiedIo = JSON.parse(JSON.stringify(io));
			Object.entries(currentIo).forEach(([key, io]) => {
				copiedIo[key] = io;
			});
			const newState = logic({gates:copiedGates,io: copiedIo, level: 'global', serialize: true});
			dispatch(updateState({gates: newState.gates, binaryIO: newState.io}));
			console.timeEnd('tick');
		}
		}>Tick</button>
		</div>
		<div style={{
			display: 'flex',
			flexDirection: 'column',
		}}>
			<span style={textStlye}>Actual hz: {actualHertz}</span>
			<span style={textStlye}>Actual refresh rate: {actualRefreshRate}</span>
			<span style={textStlye}>Total complexity: {totalComplexity}</span>
			<span style={textStlye}>Response: x:{testCall?.x} y:{testCall?.y}</span>
			<div>
			<label 
        htmlFor="description" 
        style={textStlye}
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
			fontSize: 16,
			border: 'none',
			marginTop: 10,
			outline: 'none',
			resize: 'none',
		}}
      />
			</div>
			
		</div>
	
		
		 <div style={{ display: 'flex', alignItems: 'center' }}>
      
		</div>
	</div>;
}