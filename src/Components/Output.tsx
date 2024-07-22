import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import useDrawWire from "../hooks/useDrawWire";
import { AMBER, ORANGE } from "../Constants/colors";
import { BinaryIO } from "../Interfaces/BinaryIO";

interface BinaryOutputProps {
	output: BinaryIO;
	style?: React.CSSProperties | null,
}


export function Output({style = null, output}:BinaryOutputProps) {

	const startDrawing = useDrawWire();
	const thisOutput = useSelector((state:RootState) => {
		return state.entities.binaryIO[output?.id] ?? state.entities.currentComponent.binaryIO[output?.id]})
	const handleMouseDown = (e: React.MouseEvent<any>) => {
		e.preventDefault();
		e.stopPropagation();
		console.log(`\n\nthisOutput state: ${thisOutput?.state}`);
		console.log(`thisOutput ID: ${thisOutput?.id.slice(0,5)}`);
		console.log(`this output is from? : ${thisOutput?.from?.id.slice(0,5)}`);
		thisOutput?.to?.forEach(to => {
			console.log(`this output is to: ${to.id.slice(0,5)}`);
		})
		
		startDrawing(e);
	}
	
	

	return (
		<>
			<div style={{...style,
				width: DEFAULT_INPUT_DIM.width,
				height: DEFAULT_INPUT_DIM.height,
				cursor: 'arrow',
			}}
			onMouseDown={handleMouseDown}>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: thisOutput?.state ? 'red' : 'black',
						pathColor: 'black',
					})}
					strokeWidth={12}
				></CircularProgressbar>
			</div>
		</>
	);
}
