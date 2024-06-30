async function main() {
    const [deployer] = await ethers.getSigners();
  
    const UserStorage = await ethers.getContractFactory("UserStorage");
    const userStorageAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // Reemplaza con la dirección real
    const userStorage = await UserStorage.attach(userStorageAddress);

    const allUsers = await userStorage.getAllUsers();
    console.log("Usuario registrados:", allUsers);


  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });