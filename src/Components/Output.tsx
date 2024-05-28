import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { BinaryInput } from "../Interfaces/BinaryInput";
import { BinaryOutput } from "../Interfaces/BinaryOutput";
import useDrawWire from "../hooks/useDrawWire";
import { AMBER } from "../Constants/colors";

interface BinaryOutputProps {
	output: BinaryOutput;
	style?: React.CSSProperties | null,
}

const checkOutputStateEquality = (prev:BinaryOutput|null, next:BinaryOutput|null) => {
	if(prev?.to !== next?.to){
		return false;
	} 
	return prev?.state === next?.state;
};

export function Output({style = null, output}:BinaryOutputProps) {

	const startDrawing = useDrawWire();
	const thisOutput = useSelector((state: RootState) => {
		if(output.gateId){
			return state.objectsSlice.gates[output.gateId]?.outputs[output.id];
		}else{
			return null;
		}
	}, checkOutputStateEquality)
	function handleMouseDown(e:React.MouseEvent<any>){
		e.stopPropagation();
		console.log(`THIS OUTPUT: ${thisOutput?.id} ${thisOutput?.state} ${thisOutput?.to ? 'true' : 'false'}`);
		startDrawing(e, {id: output.id, type: 'outputs', gateId: output.gateId});
	}

	return (
		<>
			<div style={{...style,
				width: DEFAULT_INPUT_DIM.width,
				height: DEFAULT_INPUT_DIM.height,
			}}
			onMouseDown={handleMouseDown}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: 'black',
						pathColor: thisOutput?.to ? AMBER : 'black',
					})}
					strokeWidth={thisOutput?.to?.length ? (thisOutput?.to?.length > 0 ? 12 : 100) : 100}
				></CircularProgressbar>
			</div>
		</>
	);
}
