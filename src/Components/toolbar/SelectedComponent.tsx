import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { CANVAS_WIDTH } from "../../Constants/defaultDimensions";
import WireSelected from "./WireSelected";
import { Wire } from "../../Interfaces/Wire";
import { Gate } from "../../Interfaces/Gate";
import GateSelected from "./GateSelected";

export default function SelectedComponent(){
	const selectedComponent = useSelector((state: RootState) => {
 		return state.mouseEventsSlice.entityClicked;
 	});

 	return <div style={{
 		width: window.innerWidth - CANVAS_WIDTH,
 		height: 300,
 		backgroundColor: 'rgb(70 70 70)',
 		left: CANVAS_WIDTH,
 		zIndex: -2,
 		position: 'absolute',
 	}}>
 		{selectedComponent?.type === 'Wire' && <WireSelected wire={selectedComponent.entity as Wire}></WireSelected>}
		{selectedComponent?.type === 'Gate' && <GateSelected gate={selectedComponent.entity as Gate}></GateSelected>}
 	</div>;
}