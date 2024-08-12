import { LINE_WIDTH } from "../Constants/defaultDimensions";
import { Line } from "@Shared/interfaces";

export const drawLine = (line: Line, context: CanvasRenderingContext2D, line_width: number = LINE_WIDTH) => {
	context.beginPath();
	context.lineCap = 'round';
	context.lineWidth = line_width;
	context.moveTo(line.startX, line.startY);
	context.lineTo(line.endX, line.endY);
	context.stroke();
};