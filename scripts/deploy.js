const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Plugin System contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Core contract
  const Core = await ethers.getContractFactory("Core");
  const core = await Core.deploy();
  await core.waitForDeployment();
  console.log("Core deployed to:", await core.getAddress());

  // Deploy ExamplePlugin with a factor of 2
  const ExamplePlugin = await ethers.getContractFactory("ExamplePlugin");
  const examplePlugin = await ExamplePlugin.deploy(2);
  await examplePlugin.waitForDeployment();
  console.log("ExamplePlugin deployed to:", await examplePlugin.getAddress());

  // Deploy VaultPlugin
  const VaultPlugin = await ethers.getContractFactory("VaultPlugin");
  const vaultPlugin = await VaultPlugin.deploy();
  await vaultPlugin.waitForDeployment();
  console.log("VaultPlugin deployed to:", await vaultPlugin.getAddress());

  // Add plugins to Core
  console.log("Registering plugins with Core...");
  
  const addExamplePluginTx = await core.addPlugin(await examplePlugin.getAddress());
  await addExamplePluginTx.wait();
  console.log("ExamplePlugin registered with Core");

  const addVaultPluginTx = await core.addPlugin(await vaultPlugin.getAddress());
  await addVaultPluginTx.wait();
  console.log("VaultPlugin registered with Core");

  // Get plugin counts and IDs
  const pluginCount = await core.getPluginCount();
  console.log(`Total registered plugins: ${pluginCount}`);
  
  console.log("Deployment complete!");
  
  // Return the deployed contract addresses
  return {
    core: await core.getAddress(),
    examplePlugin: await examplePlugin.getAddress(),
    vaultPlugin: await vaultPlugin.getAddress()
  };
}

// Execute the deployment
main()
  .then((deployedContracts) => {
    console.log("Deployed Contracts:", deployedContracts);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });