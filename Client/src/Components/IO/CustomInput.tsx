import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { ioEquality } from "./Input";
import { DEFAULT_GATE_COLOR } from "../../Constants/colors";
import { DEFAULT_INPUT_DIM, getClosestBlock, LINE_WIDTH } from "../../Constants/defaultDimensions";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { textStlye } from "../../Constants/commonStyles";
import { changeInputState, changeIOStyle, deleteInput } from "../../state/slices/entities";
import { ModuleSource } from "module";

export default function CustomInput({id, showButton}:{id:string, showButton: boolean}){
    const thisInput = useSelector((state: RootState) => {
		return state.entities.binaryIO[id] ?? state.entities.currentComponent.binaryIO[id];
    });
    const blockSize = useSelector((state: RootState) => {return state.misc.blockSize});
    const cameraOffset = useSelector((state: RootState) => {return state.mouseEventsSlice.cameraOffset});
    const eleRef = useRef<HTMLDivElement | null>(null);
    const spanRef = useRef<HTMLSpanElement | null>(null);
    const [isMouseDown, setIsMouseDown] = useState(false);

    const handleMouseDown = (e:MouseEvent | React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if(e.target !== eleRef.current && e.target !== spanRef.current) return;
        console.log(`AKASASJIAS`);
        if(e.button !== 0) return;
        setIsMouseDown(true);
    }
	const dispatch = useDispatch();
    const [hasMoved, setHasMoved] = useState(false);
    const handleMouseMove = (e:MouseEvent) => {
        if(!isMouseDown) return;
        const middleX = e.x + blockSize/2;
		const middleY = e.y;
		const {roundedX, roundedY} = getClosestBlock(middleX, middleY, blockSize);
        if(roundedX !== thisInput?.style?.left || roundedY !== thisInput?.style?.top){
            console.log(`not equal`);
            setHasMoved(true);
            dispatch(changeIOStyle({id: id, top: roundedY, left: roundedX}));
        }
    }

    const handleMouseUp = (e:MouseEvent) => {
        if(e.button !== 0) return;
        setHasMoved(false);
        setIsMouseDown(false);
        if(e.target !== eleRef.current && e.target !== spanRef.current) return;
    }
    const handleInputMouseUp = (e:MouseEvent) => {
        if(e.button !== 0) return;
        if(!isMouseDown) return;
        if(!hasMoved){
            dispatch(changeInputState(thisInput?.id));
        }
    }

    const handleContextMenu = (e:MouseEvent) => {
        e.preventDefault();
        dispatch(deleteInput(thisInput?.id));
    }
    useEffect(() => {
        eleRef.current?.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        eleRef.current?.addEventListener('mouseup', handleInputMouseUp);
        eleRef.current?.addEventListener('contextmenu', handleContextMenu);
        return () => {
            eleRef.current?.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            eleRef.current?.removeEventListener('mouseup', handleInputMouseUp);
            eleRef.current?.removeEventListener('contextmenu', handleContextMenu);
        }
    }, [blockSize, thisInput, isMouseDown, hasMoved])

    return  <div 
    ref = {eleRef}
    className="shadow" 
    style={{
        position: 'absolute',
        left: ((thisInput?.style!.left as number ?? 0) - 2*blockSize) + cameraOffset.x,
        top: ((thisInput?.style!.top as number ?? 0) - blockSize/2) + cameraOffset.y,
        width: 2*blockSize,
        height: blockSize,
        zIndex: 2,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        display: 'flex',
        backgroundColor: DEFAULT_GATE_COLOR,
    }}>
        <span
        ref = {spanRef}
        style={{
            color: 'whitesmoke',
            position: 'absolute',
            userSelect: 'none',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'}}>
                {thisInput?.state ? 'On' : 'Off'}
      </span>
        <div onClick={e => {e.stopPropagation();}} 
        style={{
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
    </div>;
}