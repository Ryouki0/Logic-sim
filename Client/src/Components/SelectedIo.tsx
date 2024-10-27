import React, { useEffect, useState } from "react";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { Input } from "./Input";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import { DEFAULT_INPUT_DIM, getClosestBlock } from "../Constants/defaultDimensions";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { DEFAULT_GATE_COLOR } from "../Constants/colors";
import { addInput } from "../state/slices/entities";
import { checkIo } from "./GlobalInputs";
import {v4 as uuidv4} from 'uuid';
import { getTokenSourceMapRange } from "typescript";
import { setSelectedIo } from "../state/slices/mouseEvents";

export default function SelectedIo(){

	const selectedIo = useSelector((state: RootState) => {return state.mouseEventsSlice.selectedIo;});
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
	const [position, setPosition] = useState({x: 0, y:0});
	const [shouldShow, setShouldShow] = useState(false);
	const dispatch = useDispatch();
	const handleMouseMove = (e:MouseEvent) => {
		const middleX = e.x - blockSize ;
		const middleY = e.y;
		const {roundedX, roundedY} = getClosestBlock(middleX, middleY, blockSize);
		setPosition({x: roundedX, y: roundedY - blockSize/2});

	};

	const handleMouseDown = (e: MouseEvent) => {
		if(e.button !== 0 || !selectedIo) return;
		console.log(`ASKOPA`);
		dispatch(addInput({
			name: `input ${inputs.length + 1}`,
			id: uuidv4(),
			type: `${selectedIo!}`,
			state: 0,
			isGlobalIo: true,
			parent: 'global',
			to: [],
			style: {
				top: position.y - DEFAULT_INPUT_DIM.height/2,
				left: position.x + 2*blockSize 
			},
			position: {x: position.x + 2*blockSize, y:position.y - DEFAULT_INPUT_DIM.height/2}
		}));
	};

	const handleContextMenu = (e:MouseEvent) => {
		dispatch(setSelectedIo(null));
		setShouldShow(false);
	};

	useEffect(() => {
		if(selectedIo){
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mousedown', handleMouseDown);
			document.addEventListener('contextmenu', handleContextMenu);
			setShouldShow(true);
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('contextmenu', handleContextMenu);
		};
	}, [selectedIo, position]);
	return <>
		{shouldShow && <div style={{
			position: 'absolute',
			left: position.x,
			top: position.y ,
			width: 2*blockSize,
			height: blockSize,
			display: 'flex',
			backgroundColor: DEFAULT_GATE_COLOR,
		}}>
			<div style={{
				width: DEFAULT_INPUT_DIM.width,
				height: DEFAULT_INPUT_DIM.height,
				position: 'relative',
				userSelect: 'none',
				left: 2*blockSize - (DEFAULT_INPUT_DIM.width / 2),
				alignSelf: 'center',
			}}
			>
				<CircularProgressbar
					value={100}
					background={true}
					styles={buildStyles({
						backgroundColor: 'black',
						pathColor: 'black',
					})}
					strokeWidth={16}
				></CircularProgressbar>
				
			</div>
		</div>}
	</>;
}