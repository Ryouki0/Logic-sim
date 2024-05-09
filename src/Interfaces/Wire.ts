import { BinaryInput } from "./BinaryInput";
import { BinaryOutput } from "./BinaryOutput";
import { Line } from "./Line";

export interface Wire{
    linearLine: Line,
    diagonalLine: Line,
    connectedTo?: BinaryInput[] | null,
    from?: BinaryOutput | Wire | null,
    state?: 0 | 1,
    id: string,
}