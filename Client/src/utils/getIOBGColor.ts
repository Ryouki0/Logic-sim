import { DEFAULT_NON_AFFECTING_COLOR } from "../Constants/colors";
import { BinaryIO } from "../Interfaces/BinaryIO";

export default function getIOBGColor(io: BinaryIO){
    if(io?.affectsOutput){
        return DEFAULT_NON_AFFECTING_COLOR;
    }else if(io?.highImpedance){
        return 'rgb(100 100 100)';
    }
    return 'rgb(0, 0, 0)'
}