const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying UserStorage contract with the account:", deployer.address);

  const UserStorage = await ethers.getContractFactory("UserStorage");
  const userStorage = await UserStorage.deploy();

  await userStorage.deployed();

  console.log("UserStorage deployed to:", userStorage.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying UserStorage contract:", error);
    process.exit(1);
  });
