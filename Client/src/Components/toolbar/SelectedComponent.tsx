import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
import WireSelected from "./WireSelected";
import { Wire } from "@Shared/interfaces";
import { Gate } from "@Shared/interfaces";
import GateSelected from "./GateSelected";
import { DEFAULT_BORDER_COLOR, DEFAULT_BUTTON_COLOR, ONYX } from "../../Constants/colors";
import entities, { switchCurrentComponent } from "../../state/slices/entities";
import { setCurrentComponentId } from "../../state/slices/misc";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import getType from "../../utils/getType";
import BinaryIOSelected from "./BinaryIOSelected";
import { current } from "@reduxjs/toolkit";

const checkCurrentEntity = (prev: Wire | Gate | BinaryIO | undefined, next: Wire | Gate | BinaryIO | undefined) => {
	if(prev && !next){
		return false;
	}
	if(!prev && next) return false;
	const prevType = getType(prev);
	const nextType = getType(next);
	if(nextType !== prevType) return false;
	if(nextType === 'BinaryIO'){
		let nextEntity: BinaryIO = next as BinaryIO;
		let prevEntity: BinaryIO = prev as BinaryIO;
		if(nextEntity.name !== prevEntity.name) return false;
		if(nextEntity.state !== prevEntity.state) return false;
		if(nextEntity.highImpedance !== prevEntity.highImpedance) return false;
	}
	
	return true;
};

export default function SelectedComponent(){
	const selectedComponent = useSelector((state: RootState) => {
 		return state.mouseEventsSlice.entityClicked;
 	});

	const currentEntity = useSelector((state: RootState) => {
		if(selectedComponent?.type === 'Gate'){
			return state.entities.currentComponent.gates[selectedComponent.entity!.id];
		}else if(selectedComponent?.type === 'Wire'){
			return state.entities.currentComponent.wires[selectedComponent.entity!.id];
		}else if(selectedComponent.type === 'BinaryIO'){
			return state.entities.currentComponent.binaryIO[selectedComponent.entity!.id];
		}
	}, checkCurrentEntity);

	const dispatch = useDispatch();

	const handleClick = (e: React.MouseEvent<any>) => {
		dispatch(switchCurrentComponent({componentId: selectedComponent.entity!.id, prevComponent: null}));
		dispatch(setCurrentComponentId(selectedComponent.entity!.id));
	};

 	return <div style={{
 		width: '100%',
 		minHeight: '30%',
		maxHeight: '50%',
		display: 'flex',
		borderStyle: 'solid',
		borderWidth: DEFAULT_BORDER_WIDTH,
		borderColor: DEFAULT_BORDER_COLOR,
		borderLeft: 'none',
		borderTop: 'none',
		borderRight: 'none',
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
			{(selectedComponent.entity as Gate).gates && <div 
				onClick={handleClick}
				className="button"
				style={{
					width: '80%',
					marginBottom: 0.5*MINIMAL_BLOCKSIZE
				}}>
				<span style={{
					color: 'white',
					fontSize: 20
				}}>
				View
				</span>
			</div>}
		</div>}
		{currentEntity && selectedComponent?.type === 'BinaryIO' && <BinaryIOSelected io={currentEntity as BinaryIO}></BinaryIOSelected>}
 	</div>;
}