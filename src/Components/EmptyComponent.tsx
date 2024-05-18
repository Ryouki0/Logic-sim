import React from 'react';
import useConnecting from '../hooks/useConnecting';
import useClock from '../hooks/useClock';

export default function EmptyComponent() {
    useConnecting();
    useClock();
    return null;
}