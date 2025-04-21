
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IPlugin.sol";

/**
 * @title VaultPlugin
 * @dev Plugin for creating and managing vaults
 */
contract VaultPlugin is IPlugin {
    // Struct to represent vault data
    struct Vault {
        address owner;
        uint256 balance;
        bool isActive;
        uint256 creationTime;
    }
    
    // Mapping of vaultId to vault data
    mapping(uint256 => Vault) private vaults;
    
    // Counter for generating unique vault IDs
    uint256 private vaultCount;
    
    // Events
    event VaultCreated(uint256 indexed vaultId, address indexed owner, uint256 initialBalance);
    event ActionPerformed(uint256 input, uint256 result);
    
    /**
     * @dev Executes the plugin action to create a new vault
     * @param input The initial balance or configuration parameter for the vault
     * @return The ID of the newly created vault
     */
    function performAction(uint256 input) external override returns (uint256) {
        uint256 vaultId = createVault(msg.sender, input);
        emit ActionPerformed(input, vaultId);
        return vaultId;
    }
    
    /**
     * @dev Creates a new vault for the specified owner with an initial balance
     * @param owner The address that will own the vault
     * @param initialBalance The initial balance of the vault
     * @return The ID of the newly created vault
     */
    function createVault(address owner, uint256 initialBalance) internal returns (uint256) {
        require(owner != address(0), "VaultPlugin: owner cannot be zero address");
        
        uint256 vaultId = vaultCount;
        
        vaults[vaultId] = Vault({
            owner: owner,
            balance: initialBalance,
            isActive: true,
            creationTime: block.timestamp
        });
        
        vaultCount++;
        
        emit VaultCreated(vaultId, owner, initialBalance);
        
        return vaultId;
    }
    
    /**
     * @dev Creates a vault directly (without going through the Core)
     * @param initialBalance The initial balance of the vault
     * @return The ID of the newly created vault
     */
    function createVaultDirect(uint256 initialBalance) external returns (uint256) {
        return createVault(msg.sender, initialBalance);
    }
    
    /**
     * @dev Gets information about a vault
     * @param vaultId The ID of the vault to query
     * @return owner The owner of the vault
     * @return balance The balance of the vault
     * @return isActive Whether the vault is active
     * @return creationTime The timestamp when the vault was created
     */
    function getVaultInfo(uint256 vaultId) external view returns (
        address owner,
        uint256 balance,
        bool isActive,
        uint256 creationTime
    ) {
        require(vaultId < vaultCount, "VaultPlugin: vault does not exist");
        
        Vault storage vault = vaults[vaultId];
        return (
            vault.owner,
            vault.balance,
            vault.isActive,
            vault.creationTime
        );
    }
    
    /**
     * @dev Gets the total number of vaults created
     * @return The count of vaults
     */
    function getVaultCount() external view returns (uint256) {
        return vaultCount;
    }
}