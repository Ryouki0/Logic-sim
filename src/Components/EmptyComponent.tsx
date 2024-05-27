import React from 'react';
import useConnecting from '../hooks/useConnecting';

export default function EmptyComponent() {
	useConnecting();
	return null;
}