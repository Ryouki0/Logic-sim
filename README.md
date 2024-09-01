# Logic Gate Simulator
## Overview
**Description**: A simple logic gate simulator built with React.

**Try it**: [Link](https://logicsim-2fs96sag7-ryouki0s-projects.vercel.app/)
## Installation
## Installation and Setup

1. **Clone the repository:**
```bash
git clone https://github.com/Ryouki0/reacttest
```
2. **Navigate into the directory:**
```bash
cd reacttest/Client
```
3. **Install dependencies:**
```bash
npm install
```
4. **Start the development server:**
```bash
npm start
```
## Key Features
- **Component Creation**: Start with basic gates ('AND', 'NO', 'DELAY', 'SWITCH') and build complex components.
- **Integrated Clock**: Gates will be evaluated in the correct order, and a single hertz is enough time to evaluate all the gates.
- **Gate Connections**: Link inputs and outputs to form intricate circuits.
- **Real-Time Simulation**: Run simulations at user defined speeds.
## Architecture
### Graph Theory & Circuit Representation:

- **Circuits as Graphs**: Each gate is taken as it's own graph. Graphs can be directed acyclic graphs(DAG) or strongly connected components(SCC).
- **Error Handling**: Detects true SCCs to prevent infinite loops.
- **Sorting Algorithms**: Uses topological sorting to manage circuit evaluations and identify true SCCs.
### State Management:
- **Normalized Data**: Entities like gates, wires, and connections are stored in separate tables for performance.
- **Current View**: Displays only the components being actively modified.
### Performance:
- **Optimized Tables**: Separate tables for active components improve performance in complex circuits.
- **Raw Reducers**: Continuous state updates bypass Immer for speed.
## Technologies Used
- React
- Redux Toolkit
- Web Workers
- React Router
