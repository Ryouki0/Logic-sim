import reducer, { addGate } from '../state/slices/entities';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => {
	return {
		v4: jest.fn()
	};
});

const genereateUIdSequence = (...ids: string[]) => {
	(uuidv4 as jest.Mock).mockReset();
	ids.forEach(id => (uuidv4 as jest.Mock).mockReturnValueOnce(id));
};

describe('gateSlice', () => {
	it('should add a NO gate to the state', () => {
		genereateUIdSequence('NO-gate-id', 'NO-input-id', 'NO-output-id')

		const initialState = {
			gates: {},
			binaryIO: {},
			wires: {},
			createdComponents: {},
		};

		const payload = {
			inputs: ['input1'],
			name: 'NO',
			id: 'unique-gate-id',
			outputs: ['output1'],
			position: { x: 0, y: 0 }
		};

		const action = addGate(payload);

		const newState = reducer(initialState, action);

		// Assert that the state has been updated correctly
		expect(Object.keys(newState.gates).length).toBe(1);
		expect(newState.gates['NO-gate-id']).toBeDefined();
		expect(newState.gates['NO-gate-id'].inputs.length).toBe(1);
		expect(newState.gates['NO-gate-id'].inputs[0]).toBe('NO-input-id');
		expect(newState.gates['NO-gate-id'].outputs.length).toBe(1);
		expect(newState.gates['NO-gate-id'].outputs[0]).toBe('NO-output-id');
		expect(newState.binaryIO['NO-input-id']).toBeDefined();
		expect(newState.binaryIO['NO-output-id']).toBeDefined();
		expect(newState.binaryIO['NO-input-id'].gateId).toBe('NO-gate-id');
		expect(newState.binaryIO['NO-output-id'].gateId).toBe('NO-gate-id');
	});
	it('should add an AND gate to the state', () => {
		genereateUIdSequence('AND-gate-id', 'AND-input-id1', 'AND-input-id2', 'AND-output-id');
		const initialState = {
			gates: {},
			binaryIO: {},
			wires: {},
			createdComponents: {},
		};

		const payload = {
			inputs: ['input1', 'input2'],
			name: 'AND',
			id: 'id',
			outputs: ['output1'],
			position: { x: 0, y: 0 }
		};
		const action = addGate(payload);
		const newState = reducer(initialState, action);

		expect(Object.keys(newState.gates).length).toBe(1);
		expect(newState.gates['AND-gate-id']).toBeDefined();
		expect(newState.gates['AND-gate-id'].inputs.length).toBe(2);
		expect(newState.gates['AND-gate-id'].inputs[0]).toBe('AND-input-id1');
		expect(newState.gates['AND-gate-id'].inputs[1]).toBe('AND-input-id2');
		expect(newState.gates['AND-gate-id'].outputs.length).toBe(1);
		expect(newState.gates['AND-gate-id'].outputs[0]).toBe('AND-output-id');
		expect(newState.binaryIO['AND-input-id1']).toBeDefined();
		expect(newState.binaryIO['AND-output-id']).toBeDefined();
		expect(newState.binaryIO['AND-input-id1'].gateId).toBe('AND-gate-id');
		expect(newState.binaryIO['AND-input-id2'].gateId).toBe('AND-gate-id');
		expect(newState.binaryIO['AND-output-id'].gateId).toBe('AND-gate-id');
	})
});