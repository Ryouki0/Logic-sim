import { DEFAULT_WIRE_COLOR } from "../Constants/colors";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { adjustBrightness } from "./adjustBrightness";

export default function getIOPathColor(thisOutput: BinaryIO | undefined){
    if(!thisOutput) return 'rgb(0, 0, 0)'
    if(thisOutput.state){
        return adjustBrightness(DEFAULT_WIRE_COLOR, 20);
    }
    if(thisOutput.to && thisOutput.to.length > 0){
        return DEFAULT_WIRE_COLOR;
    }
    if(thisOutput.from && thisOutput.from.length > 0){
        return DEFAULT_WIRE_COLOR;
    }
    return 'rgb(0, 0, 0)';
}