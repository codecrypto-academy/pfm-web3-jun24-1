const { ethers } = require("hardhat");
const { userStorageAddress } = require('../contractsInfo.json');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Replace with the address of your deployed UserStorage contract
  // const userStorageAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  // Connect to the existing UserStorage contract
  const UserStorage = await ethers.getContractFactory("UserStorage");
  const userStorage = await UserStorage.attach(userStorageAddress);

  console.log("Connected to UserStorage at:", userStorage.address);

  // Register users
  await userStorage.registerUser(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "Natalia",
    "Admin",
    "natalia"
  );
  console.log("User registered");

  await userStorage.registerUser(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "Dario",
    "Fabricante",
    "dario"
  );
  console.log("User registered");

  // Get user data
  const userData1 = await userStorage.getUser("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  console.log("User data:", userData1);

  const userData2 = await userStorage.getUser("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  console.log("User data:", userData2);

  // Login
  const login1 = await userStorage.login("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "natalia");
  console.log("Login data:", login1);

  const login2 = await userStorage.login("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "dario");
  console.log("Login data:", login2);

  // Get all registered users
  const allUsers = await userStorage.getAllUsers();
  console.log("All registered users:", allUsers);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
