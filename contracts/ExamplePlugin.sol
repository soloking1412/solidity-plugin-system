// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IPlugin.sol";

/**
 * @title ExamplePlugin
 * @dev Simple example plugin that multiplies the input by a constant factor
 */
contract ExamplePlugin is IPlugin {
    // Multiplication factor
    uint256 private immutable factor;
    
    // Events
    event ActionPerformed(uint256 input, uint256 result);
    
    /**
     * @dev Constructor sets the multiplication factor
     * @param _factor The multiplication factor to use
     */
    constructor(uint256 _factor) {
        require(_factor > 0, "ExamplePlugin: factor must be greater than zero");
        factor = _factor;
    }
    
    /**
     * @dev Executes the plugin action by multiplying the input by the factor
     * @param input The input to multiply
     * @return The result of input * factor
     */
    function performAction(uint256 input) external override returns (uint256) {
        uint256 result = input * factor;
        emit ActionPerformed(input, result);
        return result;
    }
    
    /**
     * @dev View function to calculate the result without creating a transaction
     * @param input The input to multiply
     * @return The result of input * factor
     */
    function calculateResult(uint256 input) external view returns (uint256) {
        return input * factor;
    }
    
    /**
     * @dev Gets the multiplication factor
     * @return The multiplication factor
     */
    function getFactor() external view returns (uint256) {
        return factor;
    }
}