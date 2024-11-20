import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import { textSpanContainsPosition } from 'typescript';
import { textStlye } from '../../Constants/commonStyles';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';

export default function BackToMenu(){
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const navigation = useNavigate();
	const toMenu = () => {
		navigation('/');
	};
	return <div style={{
		position: 'absolute',
		width: 'auto',
		zIndex: 1,
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