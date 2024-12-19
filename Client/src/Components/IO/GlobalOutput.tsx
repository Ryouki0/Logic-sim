import React from "react";
import { checkIo } from "../Canvas/CanvasLeftSide";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import {CustomIO} from "./CustomIO";

export default function GlobalOutput(){
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});	
	const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});
	const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset;});
	
	const outputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => {
			if((io.type === 'output' && !io.gateId) || (io.type === 'output' && io.gateId === currentComponentId)){
				return io;
			}else{
				return null;
			}
		}).filter((io): io is NonNullable<typeof io> => io !== null);
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
		{outputs.map((output, idx) => {
			return <CustomIO id={output.id} key={output.id} showButton={currentComponentId === 'global' ? true : false}></CustomIO>;
		})}
	</div>;
}