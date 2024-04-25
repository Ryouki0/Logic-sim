import { BinaryInput } from "./BinaryInput";
import { Line } from "./Line";

export interface Wire{
    linearLine: Line,
    diagonalLine: Line,
    connectedTo?: BinaryInput[] | null,
    id: string,
}