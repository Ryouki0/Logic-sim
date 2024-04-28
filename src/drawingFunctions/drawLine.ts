import { Line } from "../Interfaces/Line";

export const drawLine = (line: Line, context: CanvasRenderingContext2D) => {
    //console.log(`drawing line ${line.startY} ${line.endY}`);
    context.beginPath();
    context.lineWidth = 5;
    context.moveTo(line.startX, line.startY);
    context.lineTo(line.endX, line.endY);
    context.stroke();
};