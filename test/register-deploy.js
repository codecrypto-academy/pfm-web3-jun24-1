async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    const userRegistry = await UserRegistry.deploy();

    console.log("UserRegistry deployed to:", userRegistry.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});