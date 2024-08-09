import { CANVAS_WIDTH, DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
import { BinaryIO } from "../Interfaces/BinaryIO";

export default function isOnIo(x:number,y:number, io:BinaryIO){
	const radius = DEFAULT_INPUT_DIM.width/2;
	const ioCenter = io.position;
	const isOnIo = (
		x >= ioCenter!.x - radius &&
        x <= ioCenter!.x + radius &&
        y >= ioCenter!.y - radius &&
        y <= ioCenter!.y + radius
	);
	return isOnIo;
}