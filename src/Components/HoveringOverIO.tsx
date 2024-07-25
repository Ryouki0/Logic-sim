import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { setHoveringOverIo } from '../state/slices/mouseEvents';

export default function HoveringOverIO(){

    const io = useSelector((state: RootState) => {return state.entities.currentComponent.binaryIO});
    const dispatch = useDispatch();
    const currentlyHoveringOverIo = useSelector((state: RootState) => {return state.mouseEventsSlice.hoveringOverIo});
    const spanRef = useRef<HTMLSpanElement | null>(null);

    useEffect(() => {
        const ioEntries = Object.entries(io);

        const handleMouseMove = (e:MouseEvent) => {
            for(const [key, io] of ioEntries){
                const ioCenter = io.position;
                if(!ioCenter) return;
                const radius = DEFAULT_INPUT_DIM.width/2;
                const isOnIo = (
                    e.x >= ioCenter!.x - radius &&
                    e.x <= ioCenter!.x + radius &&
                    e.y >= ioCenter!.y - radius &&
                    e.y <= ioCenter!.y + radius
                )
                if(isOnIo){
                    if(currentlyHoveringOverIo?.id === key){
                        return;
                    }
                    dispatch(setHoveringOverIo(io));
                    return;
                }
            }
            dispatch(setHoveringOverIo(null));
        }

        document.addEventListener('mousemove', handleMouseMove);
        


        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        }
    }, [io])
    const [leftPosition, setLeftPosition] = useState(0);
    useEffect(() => {
        if (spanRef.current) {
            const spanWidth = spanRef.current.offsetWidth;
            setLeftPosition(currentlyHoveringOverIo!.position!.x - (spanWidth / 3));
        }
    }, [currentlyHoveringOverIo]);

    return <>
        {currentlyHoveringOverIo && 
        <span ref={spanRef}
        style={{
            fontSize: 20,
            fontWeight: 400,
            color: 'white', 
            position: 'absolute', 
            zIndex: 2, 
            top: currentlyHoveringOverIo.position!.y - 1.5*MINIMAL_BLOCKSIZE,
            left: currentlyHoveringOverIo.position!.x,
            transform: 'translateX(-40%)'
            }}>{currentlyHoveringOverIo.name}</span>}
    </>;
}