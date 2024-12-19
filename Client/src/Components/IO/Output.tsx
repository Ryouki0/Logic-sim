import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { AMBER, DEFAULT_BACKGROUND_COLOR, DEFAULT_WIRE_COLOR, ORANGE } from "../../Constants/colors";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import { ioEquality } from "./Input";
import { adjustBrightness } from "../../utils/adjustBrightness";
import getIOPathColor from "../../utils/getIOPathColor";
import getIOBGColor from "../../utils/getIOBGColor";

interface BinaryOutputProps {
	output: BinaryIO;
	style?: React.CSSProperties | null,
}


export const Output = React.memo(function Output({id}:{id: string}){

	const thisOutput = useSelector((state:RootState) => {
		return state.entities.binaryIO[id] ?? state.entities.currentComponent.binaryIO[id] ?? state.entities.bluePrints.io[id];}, ioEquality);
	const handleMouseDown = (e: React.MouseEvent<any>) => {
		e.preventDefault();
		console.log(`\n\nthisOutput state: ${thisOutput?.state}`);
		console.log(`this output impedance: ${thisOutput?.highImpedance}`);
		console.log(`thisOutput ID: ${thisOutput?.id.slice(0,5)}`);
		console.log(`this output is from? : ${thisOutput?.from?.map(from => from.id.slice(0,6)).join(', ')}`);
		console.log(`this output position x: ${thisOutput?.position?.x} y: ${thisOutput?.position?.y}`);
		thisOutput?.to?.forEach(to => {
			console.log(`this output is to: ${to.id.slice(0,5)}`);
		});
		thisOutput?.otherSourceIds?.forEach(id => {
			console.log(`other source: ${id.slice(0,5)}`);
		});
		
	};
	

	return <div style={{
		width: `var(--io-radius)`,
		height: `var(--io-radius)`,
		cursor: 'arrow',
		position: 'absolute',
		transform: `translate(calc(${thisOutput?.position?.x ?? 0}px - var(--io-radius) / 2), calc(${thisOutput?.position?.y ?? 0}px - var(--io-radius) / 2))`,
	}}
	onMouseDown={handleMouseDown}>
		<CircularProgressbar
			value={100}
			background={true}
			styles={buildStyles({
				backgroundColor: getIOBGColor(thisOutput),
				pathColor: getIOPathColor(thisOutput),
			})}
			strokeWidth={16}
		></CircularProgressbar>
	</div>;
}, (prev: {id: string}, next: {id: string}) => {
	// if(prevOutput?.output.id !== nextOutput?.output.id) return false;
	// if(prevOutput?.style?.top !== nextOutput?.style?.top) return false;
	// return true;
	if(prev.id !== next.id) return false;
	return true;
});
    

