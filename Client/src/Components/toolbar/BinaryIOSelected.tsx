import React from 'react';
import InputPreview from '../Preview/InputPreview';
import { BinaryIO } from '../../Interfaces/BinaryIO';
import { MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { textStlye } from '../../Constants/commonStyles';
import TextArea from '../TextArea';
import { useDispatch } from 'react-redux';
import { changeIOName } from '../../state/slices/entities';

export default function BinaryIOSelected({io} : {io: BinaryIO}){

	const dispatch = useDispatch();
	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		dispatch(changeIOName({ioId: io.id, newName: e.target.value}));
	};

	return <>
		<div style={{
			alignSelf: 'center',
			marginTop: MINIMAL_BLOCKSIZE,
		}}>
			<InputPreview inputId={io.id} style={{}}></InputPreview>
		</div>
		<div style={{
			display: 'inline-flex',
			...textStlye,
			alignItems: 'center',
		}}>
			<label>Name: </label>
			<TextArea value={io.name} onChange={handleChange}></TextArea>
		</div>
		<span style={textStlye}>High impedance: {io.highImpedance ? 'true' : 'false'}</span>
	</>;
}