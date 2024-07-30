import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { CANVAS_WIDTH } from "../../Constants/defaultDimensions";
import WireSelected from "./WireSelected";
import { Wire } from "../../Interfaces/Wire";
import { Gate } from "../../Interfaces/Gate";
import GateSelected from "./GateSelected";
import { ONYX } from "../../Constants/colors";

const checkCurrentEntity = (prev: Wire | Gate | undefined, next: Wire | Gate | undefined) => {
	if(prev && !next){
		return false;
	}
	if(!prev && next){
		return false;
	}
	return true;
}

export default function SelectedComponent(){
	const selectedComponent = useSelector((state: RootState) => {
 		return state.mouseEventsSlice.entityClicked;
 	});
	const currentEntity = useSelector((state: RootState) => {
		if(selectedComponent?.type === 'Gate'){
			return state.entities.currentComponent.gates[selectedComponent.entity!.id];
		}else if(selectedComponent?.type === 'Wire'){
			return state.entities.currentComponent.wires[selectedComponent.entity!.id];
		}
	}, checkCurrentEntity)
 	return console.log(`rendering selectedComponent`),
	<div style={{
 		width: '100%',
 		height: '30%',
		display: 'flex',
 		backgroundColor: 'rgb(70 70 70)',
		flexDirection: 'column',
 		zIndex: -2,
 	}}>
 		{currentEntity && selectedComponent?.type === 'Wire' && <WireSelected wire={selectedComponent.entity as Wire}></WireSelected>}
		{currentEntity && selectedComponent?.type === 'Gate' && 
		<div style={{
			flex: 1,
			display: 'flex',
			flexDirection: 'column'
		}}>
			<GateSelected gate={selectedComponent.entity as Gate}></GateSelected>
			{(selectedComponent.entity as Gate).gates && <div style={{
				backgroundColor:'white',
				width: '100%',
				height: 30,
				marginTop: 'auto'
		}}></div>}
		</div>}
 	</div>;
}