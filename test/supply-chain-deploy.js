async function main() {
    const [deployer, tailor] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy(tailor.address);

    console.log("SupplyChain contract deployed to:", supplyChain.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
