# The main logic of the simulator
In this simulator, two types of graphs can be created with the gates. The first, and simpler one is a directed acyclic graph (DAG).
The second is a strongly connected component (SCC). These types of graphs can coexist.

To sort the gates in a DAG, topological sort is used. However topoligcal sort is intrinsically incapable of finding SCCs.
If a gate is connected to another gate, which is a member of an SCC, the topological sort will skip it.
Normally SCCs should create an infinite loop, but with delay gates, the ordering of an SCC can be derived,
since the input of a delay gate doesn't affect the output in the same tick.

## Function `logic`:
### Description:
The `logic` function is called recursively for each nested component in a DAG.

### Parameters:
- `component.level`: Indicates the current nesting level in the graph. This is the ID of the parent.
- `component.gates`: The entire state (table) of gates.
- `component.io`: The entire state (table) of input/output.

### Steps:
1. Create a deepcopy of the gates and io, by calling the `deepCopyComponent` function.
2. Get the execution order by invoking the `getMainOrder` function, with the newly copied gates and io.
3. Loop through the execution order, and for each gate ID in the order, retrieve the corresponding gate by indexing.
4. Check the indexed gate's name, if it's 'AND', 'NO' or 'DELAY' then evaluate them.
5. After evaluating the gate, propagate it's output's state change, by calling the `propagateIoStateChange` function.
6. If the gate's name is neither of those, check if it has a gate array, if so, then run the `logic` function again, with that gate's ID as the `component.level`, and the entire gates and io state.
7. After calling the `logic` again, re-initialize the copied gates and io, to the returned ones.


## Function `getMainOrder`:
### Description:
Topologically sort the gates inside a component.

### Parameters:
