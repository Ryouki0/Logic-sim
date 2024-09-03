import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { textSpanContainsPosition } from 'typescript';
import { textStlye } from '../../Constants/commonStyles';

export default function BackToMenu(){
	const navigation = useNavigate();
	const toMenu = () => {
		navigation('/');
	};
	return <div style={{
		position: 'absolute',
		width: 'auto',
		left: 0,
		bottom: 0,}}>
		<div className='button-other' onClick={toMenu} style={{
			height: MINIMAL_BLOCKSIZE,
			fontSize: 20,
			width: 'auto',
			padding: 16,
		}}>
			<span style={{
				color: 'white',
			}}>
            Menu
			</span>
		</div>
	</div>;
}