import React from "react";
import { DEFAULT_INPUT_DIM } from "../../Constants/defaultDimensions";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { checkSingleIo } from "./InputPreview";

export default function OutputPreview({outputId, style}: {outputId: string, style: React.CSSProperties}){
	const thisOutput = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO[outputId];}, checkSingleIo);

	return <>
		<div style={{
			width: DEFAULT_INPUT_DIM.width,
			height: DEFAULT_INPUT_DIM.height,
			pointerEvents: 'none',
			cursor: 'arrow',
			...style
		}}
		>
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
	</>;
}