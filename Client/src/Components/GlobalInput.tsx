import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { checkIo } from "./GlobalInputs";
import { Input } from "./Input";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { DEFAULT_INPUT_DIM } from "../Constants/defaultDimensions";
import { DEFAULT_GATE_COLOR } from "../Constants/colors";
import CustomInput from "./CustomInput";

export default function GlobalInput(){
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	const currentComponentId = useSelector((state: RootState) => {return state.misc.currentComponentId;});
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
	return <>
		{inputs.map((input, idx) => {
			return <CustomInput id={input.id} key={input.id}></CustomInput>
		})}
	</>;
}