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

  await userStorage.registerUser(
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "Eva",
    "Confeccionista",
    "eva"
  );
  console.log("User registered");

  await userStorage.registerUser(
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "Daniel",
    "Cliente",
    "daniel"
  );
  console.log("User registered");

  // Get user data
  const userData1 = await userStorage.getUser("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  console.log("User data:", userData1);

  const userData2 = await userStorage.getUser("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  console.log("User data:", userData2);

  const userData3 = await userStorage.getUser("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
  console.log("User data:", userData3);

  const userData4 = await userStorage.getUser("0x90F79bf6EB2c4f870365E785982E1f101E93b906");
  console.log("User data:", userData4);

  // Login
  const login1 = await userStorage.login("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "natalia");
  console.log("Login data:", login1);

  const login2 = await userStorage.login("0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "dario");
  console.log("Login data:", login2);

  const login3 = await userStorage.login("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "eva");
  console.log("Login data:", login3);

  const login4 = await userStorage.login("0x90F79bf6EB2c4f870365E785982E1f101E93b906", "daniel");
  console.log("Login data:", login4);

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
