const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  // console.log("Deploying contracts with the account:", deployer.address);

  // // Deploy del contrato ProductNFT
  // const ProductNFT = await ethers.getContractFactory("ProductNFT");
  // const productNFT = await ProductNFT.deploy(deployer.address);
  // await productNFT.deployed();

  // console.log("ProductNFT deployed to:", productNFT.address);

  // Deploy del contrato ProductManager y le pasamos la dirección de ProductNFT
  const ProductManager = await ethers.getContractFactory("ProductManager");
  const productManager = await ProductManager.deploy();
  await productManager.deployed();

  console.log("ProductManager deployed to:", productManager.address);

  // Guardar las direcciones de los contratos en un archivo JSON en la raíz del proyecto
  let contractsInfo = {};
  const contractsInfoPath = path.join(__dirname, "../contractsInfo.json");
  
  contractsInfo = fs.existsSync(contractsInfoPath) ? JSON.parse(fs.readFileSync(contractsInfoPath, 'utf8')) : {};
  contractsInfo.productManagerAddress = productManager.address;

  fs.writeFileSync(contractsInfoPath, JSON.stringify(contractsInfo, null, 2));
  console.log("Contract address saved to:", contractsInfoPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });