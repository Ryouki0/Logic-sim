import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackToMenu(){
	const navigation = useNavigate();
	const toMenu = () => {
		navigation('/');
	};
	return <div style={{
		width: 0, 
		position: 'absolute',
		display: 'flex',
		left:0,
		bottom: 0,}}>
	<div className="button-other" onClick={toMenu} style={{
		bottom: 0,
		width: '80%',
	}}>
		<span style={{
			color: 'white',
			fontSize: 20,
		}}>
            Menu
		</span>
	</div>
	</div>
}