
import React, { useEffect, useRef, useState } from 'react';
import { Gate } from '../../Interfaces/Gate';
import GatePreview from '../Preview/GatePreview';
import { MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import calculateGateHeight from '../../utils/Spatial/calculateGateHeight';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { setGateDescription } from '../../state/slices/entities';
import { textStlye } from '../../Constants/commonStyles';
const checkGateEquality = (prev: Gate, next: Gate) => {
	if(prev?.nextTick !== next?.nextTick){
		return false;
	}
	if(prev?.id !== next?.id){
		return false;
	}
	if(prev?.description !== next?.description){
		return false;
	}
	return true;
};
export default function GateSelected({gate}: {gate: Gate}){

	const thisGate = useSelector((state: RootState) => {return state.entities.currentComponent.gates[gate.id];}, checkGateEquality);
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const gateChanged = useRef<boolean>(true);
	const currentText = useRef<string>('');
	const [text, setText] = useState<string>('');

	if(!gateChanged.current){
		gateChanged.current = true;
	}else{
		currentText.current = thisGate?.description ?? 'No description';
		setText('');
		gateChanged.current = false;
	}

	const gateHeight = calculateGateHeight(gate, MINIMAL_BLOCKSIZE);
	
	const textareaRef = useRef<any>(null);
	
	
	const dispatch = useDispatch();
	useEffect(() => {
		if(textareaRef.current) {
            textareaRef.current!.style.height = 'auto';
            textareaRef.current!.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [thisGate, text]);

	const handleSave = (e: any) => {
		dispatch(setGateDescription({gateId: thisGate?.id, description: text}));
	};

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		gateChanged.current = false;
		currentText.current = e.target.value;
		setText(e.target.value);

	};

	return thisGate && <>
		<div style={{
			display: 'flex',
			marginLeft: 10,
			height: 'auto',
			flexDirection: 'column',
		}}>
			<div style={{ 
				marginTop: MINIMAL_BLOCKSIZE, 
				marginLeft: -1.5*MINIMAL_BLOCKSIZE,
				alignSelf: 'center',
				height: gateHeight,
			}}>
        	<GatePreview thisGate={thisGate} verticalScale={1} />
    	</div>
			<div style={{
				display: 'flex', 
				flexDirection: 'column',
				marginTop: 10}}>
				<span style={
					textStlye
				}>
				Name: {thisGate?.name}
				</span>
				{/* <span
					style={textStlye}
				>
				Parent: {thisGate?.parent.slice(0,6)}
				</span> */}
				<span style={textStlye}>
			Complexity: {thisGate?.complexity}
				</span>
				{thisGate?.nextTick != null && (
					<span
						style={textStlye}
					>
          NextTick: {thisGate?.nextTick}
					</span>)}
				<div style={{
					color: 'white',
					fontSize: 17,
					display: 'flex',
					alignItems: 'center',
					alignContent: 'center',
				}}>
					<label 
						htmlFor="description" 
						style={{ 
							marginLeft: '5px',
							alignSelf: 'center',
							marginTop: 10,
							fontSize: 16}}
					>
        Description:
					</label>
					<textarea
						rows={1}
						spellCheck={false}
						ref={textareaRef}
						value={currentText.current}
						onChange={handleChange}
						style={{
							backgroundColor: 'transparent',
							color: 'white',
							fontSize: 17,
							border: 'none',
							marginTop: 10,
							outline: 'none',
							resize: 'none',
						}}
					/>
	  {thisGate?.description !== currentText.current && (
						<button
							onClick={handleSave}
							style={{
								color: 'white',
								backgroundColor: '#28A745',
								border: 'none',
								height: 30,
								borderRadius: 5,
	  }}>Save</button>)}
				</div>
			</div>
		</div>

	</>;
}