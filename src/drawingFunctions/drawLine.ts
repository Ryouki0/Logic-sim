import { LINE_WIDTH } from "../Constants/defaultDimensions";
import { Line } from "../Interfaces/Line";

export const drawLine = (line: Line, context: CanvasRenderingContext2D) => {
	//console.log(`drawing line ${line.startY} ${line.endY}`);
	context.strokeStyle = 'rgb(255 165 0 / 100%)';
	context.beginPath();
	context.lineWidth = LINE_WIDTH;
	context.moveTo(line.startX, line.startY);
	context.lineTo(line.endX, line.endY);
	context.stroke();
};