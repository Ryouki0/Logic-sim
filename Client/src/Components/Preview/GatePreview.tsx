import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import calculateGateHeight from '../../utils/Spatial/calculateGateHeight';
import { DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';
import InputPreview from './InputPreview';
import { calculateInputTop } from '../../utils/Spatial/calculateInputTop';
import OutputPreview from './OutputPreview';
import { Gate } from '../../Interfaces/Gate';

export default function GatePreview({thisGate, verticalScale}: {thisGate: Gate, verticalScale: number}){
    
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	return thisGate && <div style={{
		position: 'relative'
	}}>

		<div key={thisGate.id}
			style={{width: 3*blockSize, 
				height: calculateGateHeight(thisGate, MINIMAL_BLOCKSIZE) * verticalScale,
				borderTopRightRadius: 30,
				borderBottomRightRadius: 30,
		    justifySelf: 'center',
				position:'absolute',
		    backgroundColor: "rgb(100 100 100)"}}
		>
			{thisGate?.inputs?.map((inputId, idx, array) => {
				return <InputPreview inputId={inputId} key={inputId} style={{
					top: calculateInputTop(idx, array.length, MINIMAL_BLOCKSIZE)
				}}></InputPreview>;
			})}
			<div 
				style={{
					position: "absolute", 
					left: "50%", 
					top: "50%", 
					transform: "translate(-50%, -50%)"
				}}> 
			    <span
					style={{fontSize: blockSize/2 +4, 
        			userSelect: 'none', 
				    color: 'white'
					}}>
					{thisGate?.name}
				</span>
			</div>
			{thisGate?.outputs?.map((outputId, idx, array) => {
				return <OutputPreview 
					key={outputId} 
					outputId={outputId}
					style={{
						position:'absolute',
						top: calculateInputTop(idx, array.length, MINIMAL_BLOCKSIZE) + (idx*DEFAULT_INPUT_DIM.height),
						left:3*MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height/2
					}}
				></OutputPreview>;
			})}
		</div>
	</div>; 

}