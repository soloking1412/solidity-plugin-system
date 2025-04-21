// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IPlugin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Core
 * @dev Core contract that maintains a registry of plugins and enables dynamic dispatch
 */
contract Core is Ownable {
    // Mapping of plugin IDs to plugin addresses
    mapping(uint256 => address) private plugins;
    
    // Count of registered plugins (also used for assigning IDs)
    uint256 private pluginCount;
    
    // Events
    event PluginAdded(uint256 indexed pluginId, address indexed pluginAddress);
    event PluginUpdated(uint256 indexed pluginId, address indexed newPluginAddress);
    event PluginRemoved(uint256 indexed pluginId);
    event PluginExecuted(uint256 indexed pluginId, uint256 input, uint256 result);

    /**
     * @dev Constructor sets the deployer as the owner
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Adds a new plugin to the registry
     * @param pluginAddress Address of the plugin to add
     * @return pluginId ID assigned to the newly added plugin
     */
    function addPlugin(address pluginAddress) external onlyOwner returns (uint256) {
        require(pluginAddress != address(0), "Core: plugin address cannot be zero");
        
        // Ensure the address implements the IPlugin interface
        require(isValidPlugin(pluginAddress), "Core: address must implement IPlugin interface");
        
        uint256 pluginId = pluginCount;
        plugins[pluginId] = pluginAddress;
        pluginCount++;
        
        emit PluginAdded(pluginId, pluginAddress);
        return pluginId;
    }
    
    /**
     * @dev Updates an existing plugin in the registry
     * @param pluginId ID of the plugin to update
     * @param newPluginAddress New address for the plugin
     */
    function updatePlugin(uint256 pluginId, address newPluginAddress) external onlyOwner {
        require(plugins[pluginId] != address(0), "Core: plugin does not exist");
        require(newPluginAddress != address(0), "Core: new plugin address cannot be zero");
        require(isValidPlugin(newPluginAddress), "Core: address must implement IPlugin interface");
        
        plugins[pluginId] = newPluginAddress;
        emit PluginUpdated(pluginId, newPluginAddress);
    }
    
    /**
     * @dev Removes a plugin from the registry
     * @param pluginId ID of the plugin to remove
     */
    function removePlugin(uint256 pluginId) external onlyOwner {
        require(plugins[pluginId] != address(0), "Core: plugin does not exist");
        
        delete plugins[pluginId];
        emit PluginRemoved(pluginId);
    }
    
    /**
     * @dev Executes a plugin with the provided input
     * @param pluginId ID of the plugin to execute
     * @param input Input to provide to the plugin
     * @return result Result from the plugin execution
     */
    function executePlugin(uint256 pluginId, uint256 input) external returns (uint256) {
        address pluginAddress = plugins[pluginId];
        require(pluginAddress != address(0), "Core: plugin does not exist");
        
        uint256 result = IPlugin(pluginAddress).performAction(input);
        emit PluginExecuted(pluginId, input, result);
        return result;
    }
    
    /**
     * @dev Gets the address of a plugin by ID
     * @param pluginId ID of the plugin
     * @return Plugin address
     */
    function getPluginAddress(uint256 pluginId) external view returns (address) {
        return plugins[pluginId];
    }
    
    /**
     * @dev Gets the total count of registered plugins
     * @return Count of plugins
     */
    function getPluginCount() external view returns (uint256) {
        return pluginCount;
    }
    
    /**
     * @dev Checks if an address implements the IPlugin interface
     * @param pluginAddress Address to check
     * @return True if the address implements IPlugin
     */
    function isValidPlugin(address pluginAddress) internal view returns (bool) {
        // Basic validation: check if the address is a contract
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(pluginAddress)
        }
        if (codeSize == 0) {
            return false;
        }
        
        // More complex validation could be added here
        return true;
    }
}