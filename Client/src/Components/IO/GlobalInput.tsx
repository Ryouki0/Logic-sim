import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { checkIo } from "../Canvas/CanvasLeftSide";
import { Input } from "./Input";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { DEFAULT_GATE_COLOR } from "../../Constants/colors";
import {CustomIO} from "./CustomIO";
import { stat } from "fs";

export default function GlobalInput(){
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	const inputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => 
		{
			if((io.type === 'input' && !io.gateId) || (io.type === 'input' && io.gateId === currentComponentId)){
				return io;
			}else{
				return null;
			}
		})
			.filter((io): io is NonNullable<typeof io> => io !== null);
	}, checkIo);
	return <div style={{
		'--io-radius': `${ioRadius}px`,
		width: '100%',
		height: '100%',
		pointerEvents: 'none',
		position: 'absolute',
		willChange: 'transform',
		transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
	} as React.CSSProperties}>
		{inputs.map((input, idx) => {
			return <CustomIO id={input.id} key={input.id} showButton={currentComponentId === 'global' ? true : false}></CustomIO>;
		})}
	</div>;
}