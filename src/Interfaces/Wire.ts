import { Line } from "./Line";

export interface Wire{
    linearLine: Line,
    diagonalLine: Line,
    connectedToId: {id:string, type: 'input' | 'output', gateId?: string | null}[],
    from?: {id: string, type:'input' | 'output', gateId?: string | null} | null,
    id: string,
    state?: 0 | 1,
    error?: boolean | null,
}