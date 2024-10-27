import React from 'react';
import { textStlye } from '../Constants/commonStyles';
import { DEFAULT_BACKGROUND_COLOR } from '../Constants/colors';
import { useDispatch, useSelector } from 'react-redux';
import { Gate } from '@Shared/interfaces';
import { deleteBluePrint, modifyComponent } from '../state/slices/entities';
import { RootState } from '../state/store';
export default function BlueprintSettings({
	style, 
	gate, 
	setShowSettings}:{style?:React.CSSProperties, gate:Gate, setShowSettings: (value: React.SetStateAction<{
        show: boolean;
        x: number;
        y: number;
        gate: Gate | null;
    }>) => void}){
	const dispatch = useDispatch();
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const handleDelete = () => {
		if(gate.name === 'AND' || gate.name === 'SWITCH' || gate.name === 'NO' || gate.name === 'DELAY'){
			return;
		}
		dispatch(deleteBluePrint(gate.id));
		setShowSettings({gate:null, x:0, y:0, show: false});
	};

	const handleModify = () => {
		dispatch(modifyComponent({id: gate.id, blockSize: blockSize}));
		dispatch(deleteBluePrint(gate.id));
		setShowSettings({gate: null, x:0,y:0,show: false});
	};

	return <div className='blueprint-settings' 
		onContextMenu={e => {e.stopPropagation(); e.preventDefault();}} 
		style={{
			...style, 
			backgroundColor: DEFAULT_BACKGROUND_COLOR, 
			display: 'flex', 
			flexDirection: 'column',
			padding: 15,
			boxShadow: '2px 8px 12px rgba(0, 0, 1, 0.8)',
			transform: 'translateY(-2px)'}}>
		<span style={{fontSize: 20, color: 'white', marginBottom:10, alignSelf: 'center'}}>{gate?.name}</span>
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<svg 
				xmlns="http://www.w3.org/2000/svg" 
				width="20" 
				height="20" 
				fill='red'
				viewBox="0 0 22 22">
				<path d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/>
			</svg>
			<span
				onClick={handleDelete}
				style={{
					...textStlye, 
					color: 'red', 
					fontSize: 22, 
					marginLeft: 8,
					cursor: 'pointer'}}>Delete</span>
		</div>
		<div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
			<img src='/wrench-svgrepo-com.svg' width={22} height={22} color='white'></img>
			<span
				onClick={handleModify} 
				style={{fontSize: 22, marginLeft: 8, cursor: 'pointer'}}>Modify</span>
		</div>
	</div>;
}