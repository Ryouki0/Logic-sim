import { LINE_WIDTH } from "../Constants/defaultDimensions";
import { Line } from "../Interfaces/Line";

export const drawLine = (line: Line, context: CanvasRenderingContext2D, line_width: number = LINE_WIDTH) => {
	//console.log(`drawing line ${line.startY} ${line.endY}`);
	context.beginPath();
	context.lineWidth = line_width;
	context.moveTo(line.startX, line.startY);
	context.lineTo(line.endX, line.endY);
	context.stroke();
};