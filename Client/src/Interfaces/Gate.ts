
export interface Gate{
    name: string,
    id: string,
    position?: {x: number, y: number},
    gates?: string[],
    inputs: string[],
    outputs: string[],
    parent: string,
    nextTick?: 0 | 1,
    complexity: number,
    description?: string,
    wires?: string[],
    lastBlockSize?: number
}