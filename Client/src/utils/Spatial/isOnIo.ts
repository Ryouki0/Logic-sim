import { CANVAS_WIDTH, DEFAULT_INPUT_DIM } from "../../Constants/defaultDimensions";
import { BinaryIO } from "../../Interfaces/BinaryIO";

export default function isOnIo(x:number,y:number, io:BinaryIO, cameraOffset: {x: number, y: number}, ioRadius: number){
	if(!io || !cameraOffset || !io.position){
		return;
	}
	const radius = ioRadius/2;
	const ioCenter = io.position;
	const isOnIo = (
		x >= ioCenter!.x - radius + cameraOffset.x &&
        x <= ioCenter!.x + radius + cameraOffset.x &&
        y >= ioCenter!.y - radius + cameraOffset.y &&
        y <= ioCenter!.y + radius + cameraOffset.y
	);
	return isOnIo;
}