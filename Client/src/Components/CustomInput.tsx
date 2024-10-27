import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { ioEquality } from "./Input";
import { DEFAULT_GATE_COLOR } from "../Constants/colors";
import { DEFAULT_INPUT_DIM } from "../Constants/defaultDimensions";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

export default function CustomInput({id}:{id:string}){
    const thisInput = useSelector((state: RootState) => {
		return state.entities.binaryIO[id] ?? state.entities.currentComponent.binaryIO[id];
    });
    const blockSize = useSelector((state: RootState) => {return state.misc.blockSize});
    {console.log(`inside: ${thisInput?.style!.top} thisInput: ${thisInput}`)};
    
    return  <div style={{
        position: 'absolute',
        left: (thisInput?.style!.left as number ?? 0) - 2*blockSize,
        top: (thisInput?.style!.top as number ?? 0) - blockSize/2,
        width: 2*blockSize,
        height: blockSize,
        zIndex: 2,
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
    </div>;
}