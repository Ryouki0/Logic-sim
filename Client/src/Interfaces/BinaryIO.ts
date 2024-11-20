import React from 'react';
import {BinaryIOBase} from '@Shared/interfaces';

export interface BinaryIO extends BinaryIOBase{
    style?: React.CSSProperties | null,
    affectsOutput?: boolean,
    wireColor?: string | null,
}