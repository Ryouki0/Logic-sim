export interface BinaryIOBase{
    state: 0 | 1,
    gateId?: string,
    id: string,
    name: string,
    isGlobalIo: boolean,
    parent: string,
    type: 'input' | 'output',
    position?: {x:number,y:number},
    to: {id: string, type: 'input' | 'output', gateId?: string | null}[] | null,
    from?:{id: string, type: 'input' | 'output', gateId?: string | null} | null,
}

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
    wires?: string[]
}

export interface Line{
    startX: number,
    startY: number,
    endX: number,
    endY: number
}

export interface Wire{
    linearLine: Line,
    diagonalLine: Line,
    connectedToId: {id:string, type: 'input' | 'output', gateId?: string | null}[],
    from?: {id: string, type:'input' | 'output', gateId?: string | null} | null,
    id: string,
    parent: string,
    state?: 0 | 1,
    error?: boolean | null,
}