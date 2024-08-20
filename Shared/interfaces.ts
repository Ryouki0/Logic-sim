export interface BinaryIOBase{
    state: 0 | 1,
    highImpedance?: boolean,
    gateId?: string,
    id: string,
    name: string,
    isGlobalIo: boolean,
    parent: string,
    type: 'input' | 'output',
    position?: {x:number,y:number},
    to: {id: string, type: 'input' | 'output', gateId?: string | null}[] | null,
    from?: {id: string, type: 'input' | 'output', gateId?: string | null}[] | null,
    otherSourceIds?: string[]
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
    from?: {id: string, type:'input' | 'output', gateId?: string | null}[] | null,
    id: string,
    parent: string,
    state?: 0 | 1,
    error?: boolean | null,
}

export interface entities{
    wires: {[key: string]: Wire};
    gates: {[key: string]: Gate};
	bluePrints: {gates: {[key: string]:Gate}, io: {[key: string]: BinaryIOBase}, wires: {[key: string]: Wire}};
	binaryIO: {[key: string]:BinaryIOBase};
	currentComponent: {wires: {[key: string]: Wire}, gates: {[key: string]: Gate}, binaryIO: {[key: string]: BinaryIOBase}}
}