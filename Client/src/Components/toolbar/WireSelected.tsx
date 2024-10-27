import React, { useMemo } from "react";
import { Wire } from "@Shared/interfaces";
import { AMBER, ORANGE, RED_ORANGE } from "../../Constants/colors";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { BinaryIO } from "../../Interfaces/BinaryIO";
import { textStlye } from "../../Constants/commonStyles";
import { setSelectedEntity } from "../../state/slices/mouseEvents";

const checkSource = (prev: BinaryIO[] | undefined, next: BinaryIO[] | undefined) => {
	if(prev?.length !== next?.length){
		return false;
	}
	let isEqual = true;
	prev?.forEach((io, idx) => {
		if(io?.to?.length !== next?.[idx]?.to?.length){
			isEqual = false;
		}
	});
	return isEqual;
};

export default function WireSelected({wire} : {wire:Wire}){
	const dispatch = useDispatch();
	const sourceMap = useSelector((state: RootState) => {
		return wire.from?.map(source => {
			return state.entities.binaryIO[source.id] ?? state.entities.currentComponent.binaryIO[source.id];
		});
	}, checkSource);

	const handleLinkClick = (io: BinaryIO) => {
		dispatch(setSelectedEntity({entity: io, type: 'BinaryIO'}));
	};
 
	let list = sourceMap?.flatMap(source => source?.to?.map(to => to?.id));
	
	//Remove duplicate IDs
	list = [...new Set(list)];
	const toList = list;

	const targetMap = useSelector((state: RootState) => {
		return toList.map(targetId => {
			return state.entities.binaryIO[targetId!] ?? state.entities.currentComponent.binaryIO[targetId!];
		});
	}, checkSource);

	return <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
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
			{sourceMap?.map((source, idx, array) => {
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
			{targetMap?.map((target, idx, array) => {
				return <span
					key={idx}
					onClick={e => {handleLinkClick(target);}}
					className="clickable-text">{target?.name}{idx === array.length-1 ? null : ', '}</span>; 
			})}
		</div>
		
		<span style={{
			marginLeft: 10,
			color: 'white', 
			fontSize: 16,
			marginTop: 10}}>Parent: {wire.parent}</span>
	</div>;
}