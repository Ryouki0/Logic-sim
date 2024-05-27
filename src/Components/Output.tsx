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
	})
	function handleMouseDown(e:React.MouseEvent<any>){
		e.stopPropagation();
		console.log(`THIS OUTPUT: ${thisOutput?.id} ${thisOutput?.state} ${thisOutput?.to?.[0]?.id}`);
		startDrawing(e, {id: output.id, type: 'outputs', gateId: output.gateId});
	}

	return (
		<>
			{/*onsole.log(`rendering output with ID: ${thisOutput?.id}`)*/}
			<div style={{...style,
				width: DEFAULT_INPUT_DIM.width,
				height: DEFAULT_INPUT_DIM.height,
			}}
			onMouseDown={handleMouseDown}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: "grey",
						trailColor: "grey",
						pathColor: AMBER,
					})}
				></CircularProgressbar>
			</div>
		</>
	);
}
