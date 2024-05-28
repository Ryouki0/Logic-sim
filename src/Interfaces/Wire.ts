import { BinaryInput } from "./BinaryInput";
import { BinaryOutput } from "./BinaryOutput";
import { Line } from "./Line";

export interface Wire{
    linearLine: Line,
    diagonalLine: Line,
    connectedToId?: {id:string, type: 'inputs' | 'outputs', gateId?: string | null}[] | null,
    from?: {id: string, type:'inputs' | 'outputs', gateId?: string | null} | null,
    id: string,
    state?: 0 | 1,
    error?: boolean | null,
}