import React from 'react';
import useConnecting from '../hooks/useConnecting';
import useRunLogic from '../hooks/useRunLogic';

export default function EmptyComponent() {
    useConnecting();
 	return null;
}