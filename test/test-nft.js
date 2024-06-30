const { ethers } = require("hardhat");

async function main() {
  const productManagerAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
  const productNFTAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

  const [deployer] = await ethers.getSigners();

  // Attach ProductNFT contract
  const ProductNFT = await ethers.getContractFactory("ProductNFT");
  const productNFT = await ProductNFT.attach(productNFTAddress);

  // Attach ProductManager contract
  const ProductManager = await ethers.getContractFactory("ProductManager");
  const productManager = await ProductManager.attach(productManagerAddress);

  // Register products
  await productManager.connect(deployer).addProduct("Seda", 100);
  console.log("Product Seda registered");

  await productManager.connect(deployer).addProduct("Lana", 300);
  console.log("Product Lana registered");

  await productManager.connect(deployer).addProduct("Algodon", 5000);
  console.log("Product Algodon registered");

  // Get all tokens of deployer
  const tokenIds = await productManager.getAllUserTokens(deployer.address);
  console.log("Tokens del deployer:", tokenIds.map((id) => id.toString()));

  // Get and show product info by tokenId
  for (let i = 0; i < tokenIds.length; i++) {
    const [productName, productQuantity] = await productManager.getProduct(tokenIds[i]);
    console.log(`Producto ${i + 1}: Nombre=${productName}, Cantidad=${productQuantity}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error testing contracts:", error);
    process.exit(1);
  });
