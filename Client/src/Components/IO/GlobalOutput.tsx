import React from "react";
import { checkIo } from "../Canvas/CanvasLeftSide";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import CustomInput from "./CustomIO";

export default function GlobalOutput(){
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
	const outputs = useSelector((state: RootState) => {
		return Object.entries(state.entities.currentComponent.binaryIO).map(([key, io]) => {
			if((io.type === 'output' && !io.gateId) || (io.type === 'output' && io.gateId === currentComponentId)){
				return io;
			}else{
				return null;
			}
		}).filter((io): io is NonNullable<typeof io> => io !== null);
	}, checkIo);

	return <>
		{outputs.map(output => {
			return <CustomInput key={output.id} id={output.id} showButton={currentComponentId === 'global' ? true : false}></CustomInput>;
		})}
	</>;
}