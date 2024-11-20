import { Line } from "./Line";

export interface Wire{
    linearLine: Line,
    diagonalLine: Line,
    targets: {id:string, type: 'input' | 'output', gateId?: string | null}[],
    from?: {id: string, type:'input' | 'output', gateId?: string | null} | null,
    id: string,
    parent: string,
    state?: 0 | 1,
    error?: boolean | null,
    color?: string | null,
}