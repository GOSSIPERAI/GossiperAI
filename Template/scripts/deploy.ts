import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SessionPoolFactory to Base Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy SessionPoolFactory
  console.log("\nDeploying SessionPoolFactory...");
  const SessionPoolFactory = await ethers.getContractFactory("SessionPoolFactory");
  const factory = await SessionPoolFactory.deploy();
  
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  
  console.log("✅ SessionPoolFactory deployed to:", factoryAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: "baseSepolia",
    factoryAddress: factoryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  
  console.log("\n📝 Deployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n⏳ Waiting for block confirmations...");
  await factory.deploymentTransaction()?.wait(5);
  
  console.log("\n✨ Deployment complete!");
  console.log("🔗 View on BaseScan:", `https://sepolia.basescan.org/address/${factoryAddress}`);
  console.log("\n📋 Add this to your .env file:");
  console.log(`NEXT_PUBLIC_FACTORY_ADDRESS=${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

