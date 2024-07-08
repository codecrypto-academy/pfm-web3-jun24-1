const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { userStorageAddress, productManagerAddress } = require('../contractsInfo.json');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const UtilsLibrary = await ethers.getContractFactory("Utils");
  const utilsLibrary = await UtilsLibrary.deploy();

  await utilsLibrary.deployed();

  console.log("Utils deployed to:", utilsLibrary.address);


  // Deploy del contrato ProductManager
  const ProductManager = await ethers.getContractFactory("ProductManager", {
    libraries: {
      Utils: utilsLibrary.address,
    }
  });
  const productManager = await ProductManager.deploy(userStorageAddress);
  await productManager.deployed();

  console.log("ProductManager deployed to:", productManager.address);

  // Deploy del contrato TailorManagement
  const TailorManagement = await ethers.getContractFactory("Tailor", {
    libraries: {
      Utils: utilsLibrary.address,
    }
  });
  const tailorManagement = await TailorManagement.deploy(userStorageAddress, productManager.address);
  await tailorManagement.deployed();

  console.log("Tailor deployed to:", tailorManagement.address);

  // Guardar las direcciones de los contratos en un archivo JSON en la raíz del proyecto
  let contractsInfo = {};
  const contractsInfoPath = path.join(__dirname, "../contractsInfo.json");
  
  contractsInfo = fs.existsSync(contractsInfoPath) ? JSON.parse(fs.readFileSync(contractsInfoPath, 'utf8')) : {};
  contractsInfo.productManagerAddress = productManager.address;
  contractsInfo.tailorAddress = tailorManagement.address;

  fs.writeFileSync(contractsInfoPath, JSON.stringify(contractsInfo, null, 2));
  console.log("Contract addresses saved to:", contractsInfoPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
