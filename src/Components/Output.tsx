import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
	DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { BinaryInput } from "../Interfaces/BinaryInput";
import startDrawingLine from "../DrawLine";
export function Output({style = null,state}: BinaryInput) {

	const objectClicked = useSelector((state: RootState) => {return state.mouseEventsSlice.objectClicked;});
	const dispatch = useDispatch();

	function handleMouseDown(e:React.MouseEvent<any>){
		e.stopPropagation();
		startDrawingLine(e, dispatch, );
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
						backgroundColor: "grey",
						trailColor: "grey",
						pathColor: "red",
					})}
				></CircularProgressbar>
			</div>
		</>
	);
}
