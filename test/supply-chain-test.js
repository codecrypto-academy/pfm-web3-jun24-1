// test/supply-chain-test.js

const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();

  // Deploy the SupplyChain contract
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy(owner.address);
  await supplyChain.deployed();

  // Test produceRawMaterial function
  const materialType = 0; // Assuming Cotton is the first enum value in Material
  const quantity = 100; // Grams

  await supplyChain.produceRawMaterial(materialType, quantity);

  // Verify if the raw material was produced correctly
  const rawMaterial = await supplyChain.rawMaterials(materialType);

  console.log("Raw Material produced successfully:", rawMaterial);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
