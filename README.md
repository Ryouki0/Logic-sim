
---

# Logic Gate Simulator

## Overview

The **Logic Gate Simulator** is a web-based application built with React, enabling users to design, simulate, and interact with digital circuits. 

### Try it out
- **Live Demo**: [Logic Gate Simulator](https://logicsim-alpha.vercel.app)
- **Quick Start**: Load a prebuilt Overture-based CPU by clicking `Load CPU` or start fresh with an empty project to design your own circuits.

---

## Installation and Setup

Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ryouki0/Logic-sim
   ```

2. **Navigate to the client directory:**
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

---

## Key Features

- **Custom Circuit Design**: Build circuits using basic components like AND, OR, NOT, DELAY, and SWITCH gates, or create your own reusable modules.
- **Integrated Clock**: Ensures gates are evaluated in the correct order; a single hertz cycle suffices for all gates.
- **Real-Time Simulation**: Adjust simulation speed to suit your needs.
- **Infinite Canvas**: Expand your workspace without constraints, ideal for large and complex circuits.
- **Error Detection**: Automatically detects short circuits and infinite loops.

---

## Architecture

### Graph Theory and Circuit Representation
- **Graph-Based Design**: Circuits are represented as graphs, where nodes are gates and edges are connections.
- **Topological Sorting**: Evaluates circuits efficiently and handles strongly connected components (SCCs).
- **Error Prevention**: Identifies and mitigates true SCCs to avoid infinite loops and short-circuit issues.

### State Management
- **Normalized Data**: Entities are stored in optimized hash maps, split between visible and non-visible components.
- **Efficient Rendering**: Only visible entities are updated during simulations, improving performance.

### Performance Optimizations
- **Multithreading**: Utilizes two web workers:
  - One for gate evaluation.
  - One for constructing circuit connections.
- **Incremental Updates**: Syncs visible entities in real-time and reconciles data with the main thread when simulations pause.
- **Raw Reducers**: Leverages unwrapped Redux reducers for faster state updates.

---

## Technologies Used

- **React**: Frontend framework for building the user interface.
- **Redux Toolkit**: Manages state with a focus on performance.
- **Web Workers**: Handles computational tasks off the main thread.
- **React Router**: Enables seamless navigation.