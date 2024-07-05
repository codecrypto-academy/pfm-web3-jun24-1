const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying UserStorage contract with the account:", deployer.address);

  const UserStorage = await ethers.getContractFactory("UserStorage");
  const userStorage = await UserStorage.deploy();

  await userStorage.deployed();

  console.log("UserStorage deployed to:", userStorage.address);

  // Guardar las direcciones de los contratos en un archivo JSON en la raíz del proyecto
  let contractsInfo = {};
  const contractsInfoPath = path.join(__dirname, "../contractsInfo.json");

  contractsInfo = fs.existsSync(contractsInfoPath) ? JSON.parse(fs.readFileSync(contractsInfoPath, 'utf8')) : {};
  contractsInfo.userStorageAddress = userStorage.address;

  fs.writeFileSync(contractsInfoPath, JSON.stringify(contractsInfo, null, 2));
  console.log("Contract address saved to:", contractsInfoPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying UserStorage contract:", error);
    process.exit(1);
  });
