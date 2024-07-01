import { getTokenSourceMapRange } from 'typescript';
import { Gate } from '../Interfaces/Gate';
import reducer, {addGate, entities} from '../state/slices/entities';
import exp from 'constants';
import { connect } from 'react-redux';

describe('addGate', () => {
	const initialState = {
		gates: {},
		binaryIO: {},
		wires: {},
		bluePrints: {gates: {
			and1: {
				name: 'AND',
				inputs: ['andInput1', 'andInput2'],
				outputs: ['andOutput1'],
				id: 'and1',
				parent: 'global'
			},
			no1: {
				name: 'NO',
				inputs: ['noInput1'],
				outputs: ['noOutput1'],
				id: 'no1',
				parent: 'global'
			},
			layer1_MainGate: {
				name: 'layer1_MainGate',
				id: 'layer1_MainGate',
				parent: 'global',
				inputs: ['layer1_MainGate_Input1', 'layer1_MainGate_Input2'],
				gates: ['layer1_SubAndGate', 'layer1_SubNoGate'],
				outputs: ['layer1_MainGate_Output1', 'layer1_MainGate_Output2'],
			},
			layer1_SubAndGate: {
				name: 'layer1_SubAndGate',
				id: 'layer1_SubAndGate',
				parent: 'layer1_MainGate',
				inputs: ['layer1_SubAndGate_Input1', 'layer1_SubAndGate_Input2'],
				outputs: ['layer1_SubAndGate_Output1']
			},
			layer1_SubNoGate: {
				name: 'layer1_SubNoGate',
				id: 'layer1_SubNoGate',
				parent:'layer1_MainGate',
				inputs: ['layer1_SubNoGate_Input1'],
				outputs: ['layer1_SubNoGate_Output1']
			}

		}, io: {
			andInput1: {
				id: 'andInput1',
				state: 0,
				gateId: 'and1',
				isGlobalIo: false,
				type: 'input',
				parent: 'global',
				to: []
			},
			andInput2: {
				id: 'andInput2',
				state: 0,
				gateId: 'and1',
				isGlobalIo: false,
				type: 'input',
				parent: 'global',
				to: []
			},
			andOutput1: {
				id: 'andOutput1',
				state: 0,
				gateId: 'and1',
				isGlobalIo: false,
				type: 'output',
				parent: 'global',
				to: []
			},
			noInput1: {
				id: 'noInput1',
				state: 0,
				gateId: 'no1',
				isGlobalIo: false,
				type: 'input',
				parent: 'global',
				to: []
			},
			noOutput1: {
				id: 'noOutput1',
				state: 0,
				gateId: 'no1',
				isGlobalIo: false,
				type: 'output',
				parent: 'global',
				to: []
			},
			layer1_MainGate_Input1: {
				id: 'layer1_MainGate_Input1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'input',
				to: [{id: 'layer1_SubAndGate_Input1', gateId: 'layer1_SubAndGate', type: 'input'}],
				isGlobalIo: true
			},
			layer1_MainGate_Input2: {
				id: 'layer1_MainGate_Input2',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'input',
				to: [{id: 'layer1_SubAndGate_Input2', gateId: 'layer1_SubAndGate', type: 'input'}],
				isGlobalIo: true
			},
			layer1_MainGate_Output1: {
				id: 'layer1_MainGate_Output1',
				state: 0,
				parent: 'layer1_MainGate',
				to: [],
				from: {id: 'layer1_SubNoGate_Output1', gateId: 'layer1_SubNoGate', type: 'output'},
				isGlobalIo: true,
				type: 'output'
			},
			layer1_MainGate_Output2: {
				id: 'layer1_MainGate_Output2',
				state: 0,
				parent: 'layer1_MainGate',
				to: [],
				isGlobalIo: true,
				type: 'output'
			},
			layer1_SubAndGate_Input1: {
				id: 'layer1_SubAndGate_Input1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer1_MainGate_Input1', gateId: 'layer1_MainGate', type: 'input'},
				isGlobalIo: false
			},
			layer1_SubAndGate_Input2: {
				id: 'layer1_SubAndGate_Input2',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer1_MainGate_Input2', gateId: 'layer1_MainGate', type: 'input'},
				isGlobalIo: false
			},
			layer1_SubAndGate_Output1: {
				id: 'layer1_SubAndGate_Output1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'output',
				to: [{id: 'layer1_SubNoGate_Input1', gateId: 'layer1_SubNoGate', type: 'input'}],
				isGlobalIo: false
			},
			layer1_SubNoGate_Input1: {
				id: 'layer1_SubNoGate_Input1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer1_SubAndGate_Output1', gateId: 'layer1_SubAndGate', type: 'output'},
				isGlobalIo: false
			},
			layer1_SubNoGate_Output1: {
				id: 'layer1_SubNoGate_Output1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'output',
				to: [{id: 'layer1_MainGate_Output1', gateId: 'layer1_MainGate', type: 'output'}],
				isGlobalIo: false
			},
		}}
	} as entities;
	it('should add an AND gate to the state', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates["and1"]));
		let andGateId = '';
		let supposedAndGate: Gate | null = null;
		Object.entries(newState.gates).forEach(([key, gate]) => {
			andGateId = key;
			supposedAndGate = gate;
		})
		expect(Object.keys(newState.gates).length).toBe(1);
		expect(supposedAndGate!.id).not.toBe('and1');
		expect(supposedAndGate!.name).toBe('AND');
		expect(supposedAndGate!.inputs[0]).not.toBe('andInput1');
		expect(supposedAndGate!.inputs[1]).not.toBe('andInput2');
		expect(supposedAndGate!.outputs[0]).not.toBe('andOutput1');
		expect(newState.binaryIO[supposedAndGate!.inputs[1]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].gateId).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].gateId).toBe(andGateId);
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].gateId).toBe(andGateId);
		expect(newState.binaryIO[supposedAndGate!.outputs[0]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.outputs[0]].gateId).toBe(andGateId);
	});
	it('should add a NO gate to the state', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates['no1']));
		let noGateId = ''
		let supposedNoGate: Gate | null = null;
		Object.entries(newState.gates).forEach(([key, gate]) => {
			noGateId = key;
			supposedNoGate = gate;
		})
		expect(Object.keys(newState.gates).length).toBe(1);
		expect(noGateId).not.toBe('no1');
		expect(supposedNoGate!.name).toBe('NO');
		expect(supposedNoGate!.inputs[0]).not.toBe('noInput1');
		expect(supposedNoGate!.outputs[0]).not.toBe('noOutput1');
		expect(supposedNoGate!.id).not.toBe('no1');
		expect(newState.binaryIO[supposedNoGate!.inputs[0]].id).not.toBe('noInput1');
		expect(newState.binaryIO[supposedNoGate!.outputs[0]].id).not.toBe('noOutput1');
		expect(newState.binaryIO[supposedNoGate!.inputs[0]].gateId).toBe(noGateId);
		expect(newState.binaryIO[supposedNoGate!.outputs[0]].gateId).toBe(noGateId);
	});
	it('should add a 1 layer nested gate into the state, with connections', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates['layer1_MainGate']));
		const gateKeys = Object.keys(newState.gates);
		let supposedMainGate: Gate | null = null;
		let supposedAndGate: Gate | null = null;
		let supposedNoGate:Gate | null = null;
		const gateEntries = Object.entries(newState.gates);
		gateEntries.forEach(([key, gate]) => {
			if(gate.parent === 'global'){
				supposedMainGate = gate;
				console.log(`global parent for: ${gate.name}`);
			}else if(gate.name === 'layer1_SubNoGate'){
				supposedNoGate = gate;
			}else if(gate.name === 'layer1_SubAndGate'){
				supposedAndGate = gate;
			}
		})
		const ioEntries = Object.entries(newState.binaryIO);
		
		const mainGateInputIds: string[] = [];
		const andGateInputIds: string[] = [];
		const noGateInputIds: string[] = [];

		const mainGateOutputs: string[] = [];
		let andGateOutput: string = '';
		let noGateOutput: string = '';
		ioEntries.forEach(([key, io]) => {
			if(io.gateId === supposedMainGate!.id && io.type === 'input'){
				mainGateInputIds.push(key);
			}else if(io.gateId === supposedAndGate!.id && io.type ==='input'){
				andGateInputIds.push(key);
			}else if(io.gateId === supposedNoGate!.id && io.type === 'input'){
				noGateInputIds.push(key);
			}else if(io.type ==='output' && io.gateId === supposedMainGate!.id){
				mainGateOutputs.push(key);
			}else if(io.type === 'output' && io.gateId === supposedAndGate!.id){
				andGateOutput = key;
			}else if(io.type === 'output' && io.gateId === supposedNoGate!.id){
				noGateOutput = key;
			}
		})

		const connectedMainGateOutput = newState.binaryIO[mainGateOutputs[0]].from 
		? newState.binaryIO[mainGateOutputs[0]] 
		: newState.binaryIO[mainGateOutputs[1]];

		//The IDs of the gates are changed
		expect(supposedAndGate).toBeDefined();
		expect(supposedMainGate).toBeDefined();
		expect(supposedNoGate).toBeDefined();
		expect(supposedAndGate!.id).not.toBe('layer1_SubAndGate');
		expect(supposedMainGate!.id).not.toBe('layer1_MainGate');
		expect(supposedNoGate!.id).not.toBe('layer1_SubNoGate');

		//The gates' parents are correct
		expect(supposedAndGate!.parent).toBe(supposedMainGate!.id);
		expect(supposedNoGate!.parent).toBe(supposedMainGate!.id);
		expect(supposedMainGate!.parent).toBe('global');

		//The and gate's inputs have the right "gateId" and changed IDs
		expect(newState.binaryIO[supposedAndGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[1]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].id).not.toBe('layer1_SubAndGate_Input1');
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].id).not.toBe('layer1_SubAndGate_Input2');
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].gateId).toBe(supposedAndGate!.id);
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].gateId).toBe(supposedAndGate!.id);

		//The main gate's inputs are connected to the and gate's inputs
		expect(mainGateInputIds).toContain(newState.binaryIO[supposedAndGate!.inputs[0]].from!.id)
		expect(mainGateInputIds).toContain(newState.binaryIO[supposedAndGate!.inputs[1]].from!.id);
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].from?.type).toBe('input');
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].from?.type).toBe('input');
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].from?.gateId).toBe(supposedMainGate!.id);
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].from?.gateId).toBe(supposedMainGate!.id);
		expect(andGateInputIds).toContain(newState.binaryIO[mainGateInputIds[0]].to?.[0].id);
		expect(andGateInputIds).toContain(newState.binaryIO[mainGateInputIds[1]].to?.[0].id);

		//The and gate is connected to the no gate
		expect(newState.binaryIO[andGateOutput]).toBeDefined();
		expect(newState.binaryIO[andGateOutput].from).toBeFalsy();
		expect(newState.binaryIO[andGateOutput].to).toBeDefined();
		expect(newState.binaryIO[andGateOutput].to?.[0].id).toBe(noGateInputIds[0]);
		expect(newState.binaryIO[andGateOutput].to?.[0].gateId).toBe(supposedNoGate!.id);
		expect(newState.binaryIO[andGateOutput].to?.[0].type).toBe('input');
		
		expect(newState.binaryIO[noGateInputIds[0]]).toBeDefined();
		expect(newState.binaryIO[noGateInputIds[0]].id).not.toBe('layer1_SubNoGate_Input1');
		expect(newState.binaryIO[noGateInputIds[0]].from).toBeDefined();
		expect(newState.binaryIO[noGateInputIds[0]].from!.id).toBe(andGateOutput);
		expect(newState.binaryIO[noGateInputIds[0]].from!.type).toBe('output');
		expect(newState.binaryIO[noGateInputIds[0]].from!.gateId).toBe(supposedAndGate!.id);

		//Ensure the NO gate is connected to the output of the main gate
		expect(newState.binaryIO[noGateOutput]).toBeDefined();
		expect(newState.binaryIO[noGateOutput].id).not.toBe('layer1_SubNoGate_Output1');
		expect(newState.binaryIO[noGateOutput].gateId).toBe(supposedNoGate!.id);
		expect(newState.binaryIO[noGateOutput].from).toBeFalsy();
		expect(newState.binaryIO[noGateOutput].to?.[0]).toBeDefined();
		expect(mainGateOutputs).toContain(newState.binaryIO[noGateOutput].to![0].id);
		expect(connectedMainGateOutput).toBeDefined();
		expect(connectedMainGateOutput.gateId).toBe(supposedMainGate!.id);
		expect(connectedMainGateOutput.from).toBeDefined();
		expect(connectedMainGateOutput.from!.id).toBe(noGateOutput);
		expect(connectedMainGateOutput.from!.gateId).toBe(supposedNoGate!.id);
		expect(connectedMainGateOutput.from!.type).toBe('output');

		//The blueprints' IDs didn't change
		expect(newState.bluePrints.gates['layer1_MainGate']).toBeDefined();
		expect(newState.bluePrints.gates['layer1_SubAndGate']).toBeDefined();
		expect(newState.bluePrints.gates['layer1_SubNoGate']).toBeDefined();
		expect(newState.bluePrints.io['layer1_MainGate_Input1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_MainGate_Input2']).toBeDefined();
		expect(newState.bluePrints.io['layer1_MainGate_Output1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_MainGate_Output2']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubAndGate_Input1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubAndGate_Input2']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubAndGate_Output1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubNoGate_Input1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubNoGate_Output1']).toBeDefined();
	})
})