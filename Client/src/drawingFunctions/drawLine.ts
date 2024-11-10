import { LINE_WIDTH } from "../Constants/defaultDimensions";
import { Line } from "@Shared/interfaces";

export const drawLine = (
	line: Line, 
	context: CanvasRenderingContext2D, 
	line_width: number = LINE_WIDTH, 
	cameraOffset: {x: number, y: number}
) => {
	context.beginPath();
	context.lineCap = 'round';
	context.lineWidth = line_width;
	context.moveTo(line.startX + cameraOffset.x, line.startY + cameraOffset.y);
	context.lineTo(line.endX + cameraOffset.x, line.endY + cameraOffset.y);
	context.stroke();
};