import { DEFAULT_HIGH_IMPEDANCE_COLOR, DEFAULT_NON_AFFECTING_COLOR } from "../Constants/colors";
import { BinaryIO } from "../Interfaces/BinaryIO";

export default function getIOBGColor(io: BinaryIO){
	if(io?.affectsOutput){
		return DEFAULT_NON_AFFECTING_COLOR;
	}else if(io?.highImpedance){
		return DEFAULT_HIGH_IMPEDANCE_COLOR;
	}
	return 'rgb(0, 0, 0)';
}