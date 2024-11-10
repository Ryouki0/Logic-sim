import { PayloadAction } from "@reduxjs/toolkit";
import { Line } from "@Shared/interfaces";
import { entities } from "../../state/slices/entities";
import { CANVAS_OFFSET_LEFT, CANVASTOP_HEIGHT, getClosestBlock } from "../../Constants/defaultDimensions";
import changeGateIoPos from "./changeGateIoPos";

export default function recalculatePositionsPure(
    state:entities, 
    action: PayloadAction<{blockSize: number, prevSize: number, currentComponentId: string, ioRadius: number}>
) {
    const newSize = action.payload.blockSize;
    const prevSize = action.payload.prevSize;
    const ioRadius = action.payload.ioRadius;
    const currentComponentId = action.payload.currentComponentId;
    Object.entries(state.currentComponent.gates).forEach(([key, gate]) => {
        
        //CANVAS_OFFSET_LEFT - the width of the canvas left side
        const multipliers = {x:(gate.position!.x - 0) / prevSize, y: (gate.position!.y - 0) / prevSize};
        const newPosition = {x: (multipliers.x * newSize)+0, y: multipliers.y * newSize + 0};
        const newRoundedPosition = getClosestBlock(newPosition.x, newPosition.y, newSize);
        const {newIoPositions} = changeGateIoPos(gate, {
            x: newRoundedPosition.roundedX,
            y: newRoundedPosition.roundedY,
        }, newSize, state.currentComponent.binaryIO, ioRadius);
        Object.entries(newIoPositions).forEach(([key, ioPos]) => {
            state.currentComponent.binaryIO[key].position = ioPos;
        });
        gate.position = {x: newRoundedPosition.roundedX, y: newRoundedPosition.roundedY};
    });

    const transformLine = (line: Line, prevSize: number, newSize: number) => {
        const multipliers = {
            startX: (line.startX - 0) / prevSize,
            endX: (line.endX - 0) / prevSize,
            startY: (line.startY - 0) / prevSize,
            endY: (line.endY - 0) / prevSize
        };
        const newPosition = {
            startX: (multipliers.startX * newSize) + 0,
            endX: (multipliers.endX * newSize) + 0,
            startY: (multipliers.startY * newSize) + 0,
            endY: (multipliers.endY * newSize) + 0
        };
        const newRoundedStartPos = getClosestBlock(newPosition.startX, newPosition.startY, newSize);
        const newRoundedEndPos = getClosestBlock(newPosition.endX, newPosition.endY, newSize);
    
        return {
            startX: newRoundedStartPos.roundedX,
            startY: newRoundedStartPos.roundedY,
            endX: newRoundedEndPos.roundedX,
            endY: newRoundedEndPos.roundedY
        };
    };
    
    Object.entries(state.currentComponent.wires).forEach(([key, wire]) => {
        wire.linearLine = transformLine(wire.linearLine, prevSize, newSize);
        wire.diagonalLine = transformLine(wire.diagonalLine, prevSize, newSize);
    });

    Object.entries(state.currentComponent.binaryIO).forEach(([key, io]) => {
        if(io.type === 'input' && !io.gateId || io.type === 'input' && io.gateId === currentComponentId 
            || (io.type === 'output' && !io.gateId) || (io.type === 'output' && io.gateId === currentComponentId)
        ){
            const multipliers = {
                x:(io.position!.x - 0) / prevSize, 
                y: (io.position!.y - 0) / prevSize
            };

            const newPosition = {
                x: (multipliers.x * newSize)+0, 
                y: multipliers.y * newSize + 0
            };

            const newRoundedPosition = getClosestBlock(newPosition.x, newPosition.y, newSize);
            io.position!.x = newRoundedPosition.roundedX;
            io.position!.y = newRoundedPosition.roundedY;
            io.style!.top = newRoundedPosition.roundedY;
            io.style!.left = newRoundedPosition.roundedX;
        }
    })
    return state;
}