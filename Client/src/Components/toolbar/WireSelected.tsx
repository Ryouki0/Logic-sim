import React, { useMemo, useState } from "react";
import { Wire } from "@Shared/interfaces";
import { AMBER, DEFAULT_WIRE_COLOR, ORANGE, RED_ORANGE } from "../../Constants/colors";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import { textStlye } from "../../Constants/commonStyles";
import { setSelectedEntity, setShowColorPicker } from "../../state/slices/mouseEvents";

const checkSource = (prev: BinaryIO[] | undefined, next: BinaryIO[] | undefined) => {
	if(prev?.length !== next?.length){
		return false;
	}
	let isEqual = true;
	prev?.forEach((io, idx) => {
		if(io?.to?.length !== next?.[idx]?.to?.length){
			isEqual = false;
		}
		if(io?.name !== next?.[idx]?.name){
			isEqual = false;
		}
		io?.to?.forEach((to, toIdx) => {
			if(to?.id !== next?.[idx]?.to?.[toIdx]?.id){
				isEqual = false;
			}
		})
	});
	return isEqual;
};

export default function WireSelected({wire} : {wire:Wire}){
	const dispatch = useDispatch();
	const sourceList = useSelector((state: RootState) => {
		return wire.from?.map(source => {
			return state.entities.binaryIO[source.id] ?? state.entities.currentComponent.binaryIO[source.id];
		});
	}, checkSource);
	const handleLinkClick = (io: BinaryIO) => {
		dispatch(setSelectedEntity({entity: io, type: 'BinaryIO'}));
	};
 
	let list = sourceList?.flatMap(source => source?.to?.map(to => to?.id));
	
	const handleColorPick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		dispatch(setShowColorPicker({show: true, id: wire.id}));
	}
	//Remove duplicate IDs
	list = [...new Set(list)];
	const targetList = list;
	const targets = useSelector((state: RootState) => {
		return targetList.map(targetId => {
			return state.entities.binaryIO[targetId!] ?? state.entities.currentComponent.binaryIO[targetId!];
		});
	}, checkSource);

	return (
		<>
		
	<div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
		<div style={{width: 150, height: 10, backgroundColor:ORANGE, alignSelf: 'center', marginTop: '30%'}}>

		</div>
		<div style={{marginTop: 20, marginLeft: 10}}>
			<span style={{
    			color: 'white', 
    			fontSize: 16,
    			marginTop: 10
			}}>
    			Sources:{' '}
			</span>
			{sourceList?.map((source, idx, array) => {
				return <span
					key={idx}
					onClick={e => {handleLinkClick(source);}}
					className="clickable-text">
					{source?.name}{idx === array.length - 1 ? null : ', '}
				</span>;
			})}
			
		</div>
		<div style={{marginTop: 10, marginLeft: 10}}>
			<span style={{color: 'white', fontSize: 16, marginTop: 10}}>Targets:{' '}</span>
			{targets?.map((target, idx, array) => {
				return <span
					key={idx}
					onClick={e => {handleLinkClick(target);}}
					className="clickable-text">{target?.name}{idx === array.length-1 ? null : ', '}</span>; 
			})}
		</div>
		<div className="clickable-div" onClick={e => {handleColorPick(e)}}>
			<span style={{color: 'white'}}>Color: </span>
			<div style={{width: 20, height: 20, backgroundColor: wire.color ?? DEFAULT_WIRE_COLOR, borderWidth: 1, marginLeft:10, borderStyle: 'solid'}}></div>
		</div>
	</div>
	</>
	)
}