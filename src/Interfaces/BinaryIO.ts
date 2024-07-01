
export interface BinaryIO{
    state: 0 | 1,
    style?: React.CSSProperties | null,
    gateId?: string,
    id: string,
    isGlobalIo: boolean,
    parent: string,
    type: 'input' | 'output',
    position?: {x:number,y:number},
    to: {id: string, type: 'input' | 'output', gateId?: string | null}[] | null,
    from?:{id: string, type: 'input' | 'output', gateId?: string | null} | null,
}