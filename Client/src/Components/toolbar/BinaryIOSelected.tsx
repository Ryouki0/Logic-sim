import React from 'react';
import InputPreview from '../Preview/InputPreview';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { textStlye } from '../../Constants/commonStyles';
import TextArea from '../TextArea';
import { useDispatch, useSelector } from 'react-redux';
import { changeIOName } from '../../state/slices/entities';
import { RootState } from '../../state/store';
import { Gate } from '@Shared/interfaces';
import { setSelectedEntity } from '../../state/slices/mouseEvents';

export default function BinaryIOSelected({io} : {io: BinaryIO}){
	const gate = useSelector((state: RootState) => {return state.entities.gates[io.gateId!] ??
		state.entities.currentComponent.gates[io.gateId!]});

	const dispatch = useDispatch();
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		dispatch(changeIOName({ioId: io.id, newName: e.target.value}));
	};

	const handleLink = () => {
		dispatch(setSelectedEntity({entity: gate, type: 'Gate'}));
	}

	return <>
		<div style={{
			marginLeft: 10,
			alignSelf: 'center',
			marginTop: MINIMAL_BLOCKSIZE,
		}}>
			<InputPreview inputId={io.id} style={{}}></InputPreview>
		</div>
		<div style={{
			marginLeft: 10,
			display: 'inline-flex',
			...textStlye,
			alignItems: 'center',
		}}>
			<label>Name: </label>
			<TextArea value={io.name} onChange={handleChange}></TextArea>
		</div>
		<div style={{marginTop: 10}}>
			<span style={{...textStlye, marginLeft: 10}}>Gate: </span>
			<span className='clickable-text' onClick={handleLink}>{gate?.name}</span>
		</div>
		<span style={{...textStlye, marginLeft: 10}}>High impedance: {io.highImpedance ? 'true' : 'false'}</span>
		
	</>;
}