import { DEFAULT_HIGH_IMPEDANCE_COLOR, DEFAULT_WIRE_COLOR } from "../Constants/colors";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { adjustBrightness } from "./adjustBrightness";
import { blendColors } from "./blendColors";

export default function getIOPathColor(thisOutput: BinaryIO | undefined, from?: BinaryIO[] | null){
	if(!thisOutput) return 'rgb(0, 0, 0)';
	let trueSource = from?.find(from => !from?.highImpedance);
	let color = (trueSource?.wireColor ?? DEFAULT_WIRE_COLOR);
	if(from && from.length > 0){
		if(!trueSource && from && from.length >= 1){
			color = from?.[0]?.wireColor ?? DEFAULT_WIRE_COLOR;
			color = blendColors(color, DEFAULT_HIGH_IMPEDANCE_COLOR);
		}
	}else{
		color = thisOutput?.wireColor ?? DEFAULT_WIRE_COLOR;
		if(thisOutput?.highImpedance){
			color = blendColors(color, DEFAULT_HIGH_IMPEDANCE_COLOR);
		}
	}
	
	if(thisOutput?.state){
		return adjustBrightness(color, 20);
	}
	if(thisOutput?.to && thisOutput?.to.length > 0){
		return color;
	}
	if(thisOutput?.from && thisOutput?.from.length > 0){
		return color;
	}
	return 'rgb(0, 0, 0)';
}