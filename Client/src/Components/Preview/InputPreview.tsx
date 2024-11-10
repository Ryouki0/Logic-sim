import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { DEFAULT_INPUT_DIM } from "../../Constants/defaultDimensions";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import getIOPathColor from "../../utils/getIOPathColor";
import getIOBGColor from "../../utils/getIOBGColor";

export const checkSingleIo = (prev: BinaryIO, next: BinaryIO) => {
	if(prev.state !== next.state){
		return false;
	}
	if(prev.name !== next.name){
		return false;
	}
	return true;
};	

export default function InputPreview({inputId, style} : {inputId: string, style: React.CSSProperties}){
	const thisInput = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO[inputId];}, checkSingleIo);

	return <>
		<div style={{
			width: DEFAULT_INPUT_DIM.width,
			height: DEFAULT_INPUT_DIM.height,
			position: 'relative',
			userSelect: 'none',
			left: -(DEFAULT_INPUT_DIM.width / 2),
			...style
		}}
		>
			<CircularProgressbar
				value={100}
				background={true}
				styles={buildStyles({
					backgroundColor: getIOBGColor(thisInput),
					pathColor: getIOPathColor(thisInput),
				})}
				strokeWidth={16}
			></CircularProgressbar>
		</div>
	</>;
}