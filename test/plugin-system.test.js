const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Plugin System", function () {
  let owner, user1, user2;
  let core, examplePlugin, vaultPlugin;
  let examplePluginId, vaultPluginId;

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Core contract
    const Core = await ethers.getContractFactory("Core");
    core = await Core.deploy();
    await core.waitForDeployment();

    // Deploy ExamplePlugin with a factor of 2
    const ExamplePlugin = await ethers.getContractFactory("ExamplePlugin");
    examplePlugin = await ExamplePlugin.deploy(2);
    await examplePlugin.waitForDeployment();

    // Deploy VaultPlugin
    const VaultPlugin = await ethers.getContractFactory("VaultPlugin");
    vaultPlugin = await VaultPlugin.deploy();
    await vaultPlugin.waitForDeployment();

    // Add plugins to Core
    await core.addPlugin(await examplePlugin.getAddress());
    examplePluginId = 0; // First plugin added will have ID 0
    
    await core.addPlugin(await vaultPlugin.getAddress());
    vaultPluginId = 1; // Second plugin added will have ID 1
  });

  describe("Core Contract", function () {
    it("Should add plugins correctly", async function () {
      expect(await core.getPluginAddress(examplePluginId)).to.equal(await examplePlugin.getAddress());
      expect(await core.getPluginAddress(vaultPluginId)).to.equal(await vaultPlugin.getAddress());
      expect(await core.getPluginCount()).to.equal(2);
    });

    it("Should only allow owner to add plugins", async function () {
      const ExamplePlugin = await ethers.getContractFactory("ExamplePlugin");
      const newPlugin = await ExamplePlugin.deploy(3);
      await newPlugin.waitForDeployment();

      await expect(
        core.connect(user1).addPlugin(await newPlugin.getAddress())
      ).to.be.revertedWithCustomError(core, "OwnableUnauthorizedAccount");
    });

    it("Should update plugin correctly", async function () {
      const ExamplePlugin = await ethers.getContractFactory("ExamplePlugin");
      const newPlugin = await ExamplePlugin.deploy(3);
      await newPlugin.waitForDeployment();

      await core.updatePlugin(examplePluginId, await newPlugin.getAddress());
      expect(await core.getPluginAddress(examplePluginId)).to.equal(await newPlugin.getAddress());
    });

    it("Should only allow owner to update plugins", async function () {
      const ExamplePlugin = await ethers.getContractFactory("ExamplePlugin");
      const newPlugin = await ExamplePlugin.deploy(3);
      await newPlugin.waitForDeployment();

      await expect(
        core.connect(user1).updatePlugin(examplePluginId, await newPlugin.getAddress())
      ).to.be.revertedWithCustomError(core, "OwnableUnauthorizedAccount");
    });

    it("Should remove plugin correctly", async function () {
      await core.removePlugin(examplePluginId);
      expect(await core.getPluginAddress(examplePluginId)).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should only allow owner to remove plugins", async function () {
      await expect(
        core.connect(user1).removePlugin(examplePluginId)
      ).to.be.revertedWithCustomError(core, "OwnableUnauthorizedAccount");
    });
  });

  describe("Example Plugin", function () {
    it("Should execute example plugin correctly", async function () {
      const inputValue = 5;
      const expectedOutput = inputValue * 2; // factor is 2
      
      // Execute the plugin through Core
      const tx = await core.executePlugin(examplePluginId, inputValue);
      await tx.wait();
      
      // Use the view function to check the result
      const resultFromCalculation = await examplePlugin.calculateResult(inputValue);
      expect(resultFromCalculation).to.equal(expectedOutput);
    });

    it("Should get the correct factor", async function () {
      expect(await examplePlugin.getFactor()).to.equal(2);
    });
  });

  describe("Vault Plugin", function () {
    it("Should create a vault through Core", async function () {
      const initialBalance = 100;
      
      // Execute vault plugin through core
      await core.executePlugin(vaultPluginId, initialBalance);
      
      // Verify vault was created (assuming it's the first vault with ID 0)
      expect(await vaultPlugin.getVaultCount()).to.equal(1);
      
      const vaultInfo = await vaultPlugin.getVaultInfo(0);
      expect(vaultInfo[0]).to.equal(await core.getAddress()); // Owner should be Core contract
      expect(vaultInfo[1]).to.equal(initialBalance); // Balance should match
      expect(vaultInfo[2]).to.equal(true); // Should be active
    });

    it("Should create a vault directly", async function () {
      const initialBalance = 200;
      
      await vaultPlugin.createVaultDirect(initialBalance);
      
      expect(await vaultPlugin.getVaultCount()).to.equal(1);
      
      const vaultInfo = await vaultPlugin.getVaultInfo(0);
      expect(vaultInfo[0]).to.equal(await owner.getAddress()); // Owner should be the caller
      expect(vaultInfo[1]).to.equal(initialBalance); // Balance should match
    });

    it("Should create multiple unique vaults", async function () {
      await vaultPlugin.createVaultDirect(100);
      await vaultPlugin.createVaultDirect(200);
      await vaultPlugin.connect(user1).createVaultDirect(300);
      
      expect(await vaultPlugin.getVaultCount()).to.equal(3);
      
      const vault0 = await vaultPlugin.getVaultInfo(0);
      const vault1 = await vaultPlugin.getVaultInfo(1);
      const vault2 = await vaultPlugin.getVaultInfo(2);
      
      expect(vault0[0]).to.equal(await owner.getAddress());
      expect(vault1[0]).to.equal(await owner.getAddress());
      expect(vault2[0]).to.equal(await user1.getAddress());
      
      expect(vault0[1]).to.equal(100);
      expect(vault1[1]).to.equal(200);
      expect(vault2[1]).to.equal(300);
    });
  });

  describe("Integration Tests", function () {
    it("Should handle multiple plugin executions", async function () {
      // First create a vault
      const vaultTx = await core.executePlugin(vaultPluginId, 100);
      await vaultTx.wait();
      const vaultId = 0; // First vault will have ID 0
      
      // Then use example plugin with the vault ID
      const multiplyTx = await core.executePlugin(examplePluginId, vaultId);
      await multiplyTx.wait();
      
      // Check result directly from plugin using the view function
      const expectedResult = vaultId * 2;
      const directResult = await examplePlugin.calculateResult(vaultId);
      expect(directResult).to.equal(expectedResult);
    });

    it("Should fail gracefully when executing non-existent plugin", async function () {
      const nonExistentPluginId = 999;
      
      await expect(
        core.executePlugin(nonExistentPluginId, 100)
      ).to.be.revertedWith("Core: plugin does not exist");
    });
  });
});