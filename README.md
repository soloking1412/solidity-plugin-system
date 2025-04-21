# Solidity Modular Plugin System

This project implements a modular, plugin-based extension system in Solidity. The system consists of a Core contract that maintains a registry of plugins, and plugins can be dynamically executed through the Core.

## Overview

The system includes:

1. **Core Contract**: Maintains a registry of plugins and enables dynamic dispatch to these plugins.
2. **Plugin Interface**: Defines a common interface that all plugins must implement.
3. **Example Plugin**: A simple plugin that multiplies an input by a constant factor.
4. **Vault Creation Plugin**: A plugin that creates vaults and returns a vault identifier.

## Project Structure

```
.
├── contracts/
│   ├── Core.sol              # Main contract for plugin registry and dispatch
│   ├── IPlugin.sol           # Interface for plugins
│   ├── ExamplePlugin.sol     # Simple example plugin
│   └── VaultPlugin.sol       # Vault creation plugin
├── test/
│   └── plugin-system.test.js # Test suite
├── scripts/
│   └── deploy.js             # Deployment script
├── hardhat.config.js         # Hardhat configuration
└── README.md                 # This file
```

## Requirements

- Node.js (v14+)
- npm or yarn
- Hardhat

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd solidity-plugin-system
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Compilation

Compile the smart contracts:

```
npx hardhat compile
```

## Testing

Run the test suite:

```
npx hardhat test
```

This will execute the tests in `test/plugin-system.test.js`, which verify:
- Registry management in the Core contract
- Plugin execution
- Vault creation

## Deployment

You can deploy the contracts to a local development network:

```
npx hardhat node
```

Then in a separate terminal:

```
npx hardhat run scripts/deploy.js --network localhost
```

## Usage

### Core Contract

The Core contract manages the plugin registry and dispatches calls to plugins:

- `addPlugin(address pluginAddress)`: Adds a new plugin to the registry.
- `updatePlugin(uint256 pluginId, address newPluginAddress)`: Updates an existing plugin.
- `removePlugin(uint256 pluginId)`: Removes a plugin from the registry.
- `executePlugin(uint256 pluginId, uint256 input)`: Executes a plugin with the given input.
- `getPluginAddress(uint256 pluginId)`: Gets the address of a plugin.
- `getPluginCount()`: Gets the total count of registered plugins.

### ExamplePlugin

A simple plugin that multiplies the input by a constant factor:

- `performAction(uint256 input)`: Multiplies the input by the factor and returns the result.
- `getFactor()`: Gets the multiplication factor.

### VaultPlugin

A plugin for creating and managing vaults:

- `performAction(uint256 input)`: Creates a vault with the given initial balance.
- `createVaultDirect(uint256 initialBalance)`: Creates a vault directly (without going through Core).
- `getVaultInfo(uint256 vaultId)`: Gets information about a vault.
- `getVaultCount()`: Gets the total number of vaults created.

## Deployment Script

The deployment script will:
1. Deploy the Core contract
2. Deploy the ExamplePlugin with a factor of 2
3. Deploy the VaultPlugin
4. Register both plugins with the Core

## Security Considerations

- The Core contract uses OpenZeppelin's Ownable for access control.
- The Core contract validates that plugin addresses actually point to contracts.
- The Core contract emits events for all registry changes and plugin executions.

## License

MIT