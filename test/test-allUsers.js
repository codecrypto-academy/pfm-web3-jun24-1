async function main() {
    const [deployer] = await ethers.getSigners();
  
    const UserStorage = await ethers.getContractFactory("UserStorage");
    const userStorageAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
    const userStorage = await UserStorage.attach(userStorageAddress);

    //const delUser = await userStorage.deleteUser("0xf584B85FFecEF27dBAAC9600FEf45e9d75548E48");

     const allUsers = await userStorage.getAllUsers();
     console.log("Usuario registrados:", allUsers);


  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });