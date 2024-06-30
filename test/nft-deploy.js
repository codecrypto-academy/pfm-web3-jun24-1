const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy del contrato ProductNFT
    const ProductNFT = await ethers.getContractFactory("ProductNFT");
    const productNFT = await ProductNFT.deploy();
    await productNFT.deployed();

    console.log("ProductNFT deployed to:", productNFT.address);

    // Deploy del contrato ProductManager y le pasamos la dirección de ProductNFT
    const ProductManager = await ethers.getContractFactory("ProductManager");
    const productManager = await ProductManager.deploy(productNFT.address);
    await productManager.deployed();

    console.log("ProductManager deployed to:", productManager.address);

    // Guardar las direcciones de los contratos en un archivo JSON en la raíz del proyecto
    const contractsInfo = {
        productNFTAddress: productNFT.address,
        productManagerAddress: productManager.address,
    };

    const contractsInfoPath = path.join(__dirname, "../contractsInfo.json");
    fs.writeFileSync(contractsInfoPath, JSON.stringify(contractsInfo));
    console.log("Contract addresses saved to:", contractsInfoPath);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });