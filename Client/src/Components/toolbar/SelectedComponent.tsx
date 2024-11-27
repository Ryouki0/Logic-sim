import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { CANVAS_WIDTH, DEFAULT_BORDER_WIDTH, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
import WireSelected from "./WireSelected";
import { Wire } from "@Shared/interfaces";
import { Gate } from "@Shared/interfaces";
import GateSelected from "./GateSelected";
import { DEFAULT_BACKGROUND_COLOR, DEFAULT_BORDER_COLOR, DEFAULT_BUTTON_COLOR, ONYX } from "../../Constants/colors";
import entities, { switchCurrentComponent } from "../../state/slices/entities";
import { changeBlockSize, setCurrentComponentId } from "../../state/slices/misc";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import getType from "../../utils/getType";
import BinaryIOSelected from "./BinaryIOSelected";

const checkCurrentEntity = (prev: Wire | Gate | BinaryIO | undefined, next: Wire | Gate | BinaryIO | undefined) => {
	if(prev && !next){
		return false;
	}
	if(!prev && next) return false;
	const prevType = getType(prev);
	const nextType = getType(next);
	if(nextType !== prevType) return false;
	if(nextType === 'BinaryIO'){
		const nextEntity: BinaryIO = next as BinaryIO;
		const prevEntity: BinaryIO = prev as BinaryIO;
		if(nextEntity.name !== prevEntity.name) return false;
		if(nextEntity.id !== prevEntity.id) return false;
		if(nextEntity.state !== prevEntity.state) return false;
		if(nextEntity.highImpedance !== prevEntity.highImpedance) return false;
	}else if(nextType === 'Wire'){
		const nextEntity: Wire = next as Wire;
		const prevEntity: Wire = prev as Wire;
		if(nextEntity?.id !== prevEntity?.id) {
			return false;
		};
		if(nextEntity?.targets?.length !== prevEntity?.targets?.length) return false;
		if(nextEntity?.from?.length !== prevEntity?.from?.length) return false;
		if(nextEntity?.color !== prevEntity?.color) return false;
	}
	
	return true;
};

export default function SelectedComponent(){
	const selectedComponent = useSelector((state: RootState) => {
 		return state.mouseEventsSlice.entityClicked;
 	});
	 const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});
	 const ioRadius = useSelector((state: RootState) => {return state.misc.ioRadius;});

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
		dispatch(switchCurrentComponent({componentId: selectedComponent.entity!.id, prevComponent: null, blockSize, ioRadius}));
		dispatch(changeBlockSize((selectedComponent.entity! as Gate)!.lastBlockSize!));
		dispatch(setCurrentComponentId(selectedComponent.entity!.id));
	};

 	return <div
		onWheel={e => {e.stopPropagation();}} 
		style={{
 		width: '100%',
 		height: '30%',
			display: 'flex',
			borderStyle: 'solid',
			overflow: 'auto',
			borderWidth: DEFAULT_BORDER_WIDTH,
			borderColor: DEFAULT_BORDER_COLOR,
			borderLeft: 'none',
			borderTop: 'none',
			borderRight: 'none',
 		backgroundColor: DEFAULT_BACKGROUND_COLOR,
			flexDirection: 'column',
 	}}>
 		{currentEntity && selectedComponent?.type === 'Wire' && <WireSelected wire={selectedComponent.entity as Wire}></WireSelected>}
		{currentEntity && selectedComponent?.type === 'Gate' && 
		<div style={{
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