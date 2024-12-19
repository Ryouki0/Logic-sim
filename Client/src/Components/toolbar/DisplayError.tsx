import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { CANVAS_WIDTH } from '../../Constants/defaultDimensions';
import '../../index.css';
export default function DisplayError(){
	const error = useSelector((state: RootState) => {return state.clock.error;});
	const canvasWidth = useSelector((state: RootState) => {return state.misc.canvasWidth});

	return (
	<>
		{error.isError && <div 
			className='error-container'
			style={{
				opacity: 0.8,
				backgroundColor: 'red',
				width: window.innerWidth - canvasWidth - 15,
				marginLeft: 5,
				marginTop: 10,
				height: '10%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
			<span style={{
				fontSize: 20,
				color: 'white'
			}}>
            ERROR
			</span>
			<span style={{
				color: 'white',
				fontSize: 18,
				padding: 10
			}}>
				{error.extraInfo}
			</span>
		</div>
		}
	</>)
}