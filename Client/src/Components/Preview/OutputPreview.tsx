import React from "react";
import { DEFAULT_INPUT_DIM } from "../../Constants/defaultDimensions";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { checkSingleIo } from "./InputPreview";
import getIOPathColor from "../../utils/getIOPathColor";
import { DEFAULT_HIGH_IMPEDANCE_COLOR } from "../../Constants/colors";
import getIOBGColor from "../../utils/getIOBGColor";

export default function OutputPreview({outputId, style}: {outputId: string, style: React.CSSProperties}){
	const thisOutput = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO[outputId];}, checkSingleIo);

	return <>
		<div style={{
			width: DEFAULT_INPUT_DIM.width,
			height: DEFAULT_INPUT_DIM.height,
			pointerEvents: 'none',
			position: 'relative',
			cursor: 'arrow',
			...style
		}}
		>
			<CircularProgressbar
				value={100}
				background={true}
				styles={buildStyles({
					backgroundColor: getIOBGColor(thisOutput),
					pathColor: getIOPathColor(thisOutput),
				})}
				strokeWidth={16}
			></CircularProgressbar>
			
		</div>
	</>;
}