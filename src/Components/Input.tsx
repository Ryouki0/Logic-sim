import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  DEFAULT_CANVAS_DIM,
  DEFAULT_INPUT_DIM,
} from "../Constants/defaultDimensions";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";
import { BinaryInput } from "../Interfaces/BinaryInput";
export function Input({style = null,state,}: BinaryInput) {

  const objectClicked = useSelector((state: RootState) => {return state.mouseEventsSlice.objectClicked});
  
  function handleMouseUp(e:React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if(objectClicked == 'Wire'){
      console.log(`connected ${objectClicked}`);
    }
  }

  return (
    <>
    <div style={{...style,
      width: DEFAULT_INPUT_DIM.width,
      height: DEFAULT_INPUT_DIM.height,
      
      position: 'relative',
      left: -(DEFAULT_INPUT_DIM.width / 2)
    }}
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={(e) => {handleMouseUp(e)}}>
        <CircularProgressbar
          value={100}
          background={true}
          styles={buildStyles({
            backgroundColor: "grey",
            trailColor: "grey",
            pathColor: "red",

          })}
        ></CircularProgressbar>
      </div>
    </>
  );
}
