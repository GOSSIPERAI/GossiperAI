const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting SessionPayment contract deployment to Base...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contract with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy the contract
  console.log("⏳ Deploying SessionPayment contract...");
  const SessionPayment = await hre.ethers.getContractFactory("SessionPayment");
  const sessionPayment = await SessionPayment.deploy();

  await sessionPayment.waitForDeployment();
  const contractAddress = await sessionPayment.getAddress();

  console.log("✅ SessionPayment deployed to:", contractAddress);
  console.log("🔗 Transaction hash:", sessionPayment.deploymentTransaction().hash);

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name);
  console.log("🆔 Chain ID:", network.chainId.toString());

  // Save deployment information
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    deploymentTime: new Date().toISOString(),
    transactionHash: sessionPayment.deploymentTransaction().hash,
    blockNumber: sessionPayment.deploymentTransaction().blockNumber
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to file
  const deploymentFile = path.join(
    deploymentsDir,
    `${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n📄 Deployment info saved to:", deploymentFile);

  // Also save to a latest.json file for easy access
  const latestFile = path.join(deploymentsDir, "latest.json");
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Latest deployment info saved to:", latestFile);

  // Wait for a few block confirmations before verifying
  if (network.chainId.toString() !== "31337") {
    console.log("\n⏳ Waiting for block confirmations...");
    await sessionPayment.deploymentTransaction().wait(5);
    console.log("✅ Block confirmations received");

    // Verify contract on Basescan
    console.log("\n🔍 Verifying contract on Basescan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Basescan");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
      console.log("You can verify manually later with:");
      console.log(`npx hardhat verify --network ${network.name} ${contractAddress}`);
    }
  }

  // Display contract information
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Contract Address:", contractAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("=".repeat(60));

  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Add the contract address to your .env.local file:");
  console.log(`   NEXT_PUBLIC_SESSION_PAYMENT_CONTRACT=${contractAddress}`);
  console.log("2. Update your frontend to use the new contract address");
  console.log("3. Test the contract functions on the Base network");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
