# Logic Gate Simulator
## Overview
-**Description**: A simple logic gate simulator, made with react.

## Key features
- **Create bigger components**: Start with 'AND', 'NO' and 'DELAY' gates. From these gates create bigger components.
- **Connect gates together**: Connect the inputs and outputs of the gates together, to form more complex circuits.
- **Real time simulation**: Run the simulation at a user specified hertz.

## Architecture

### Graph theory & circuit representation
- **Circuits as graphs**: In this simulation, there are two types of graphs that can be created using logic gates: directed acyclic graphs (DAG), and strongly connected components (SCC).
  And the SCCs further can be broken down into two separate types: 'Delay allowed SCC' and 'True SCC'.
  - A delay allowed SCC is taken as a DAG, where the root is a delay gate.
  - A true SCC will show an error to the user, since it would cause an infinite loop.
- **Sorting algorithms**: Instead of finding the true SCCs with common algorithms, like Tarjan's algorithm, the simulation filters them out. First run a topological sort on the DAG. Then, find every delay gate that hasn't been evaluated yet, and take them as roots of DAGs. If there are still gates that have not been evaluated yet, then there is one, or more true SCC.
