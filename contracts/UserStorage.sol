// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserStorage {

    //Informacion del usuario
    struct User {
        string username;
        string role;
        bytes32 passwordHash;
        bool exists;
    }

    //Usuarios registrados
    struct RegisteredUser {
        string username;
        string role;
        address userAddress;
    }

    mapping(address => User) private users; //Direcciones a informacion del usuario
    mapping(string => address) private usernames; //Nombres de usuario a direcciones
    address[] private userAddresses; //Lista de direcciones
    RegisteredUser[] private registeredUsers; //Lista de usuarios registrados
    address public owner; //Direccion del propietario

    event UserRegistered(address indexed userAddress, string username);
    event UserRoleUpdated(address indexed userAddress, string role);
    event UserDeleted(address indexed userAddress);

    //Registre el acceso al resto de usuarios
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Solo el Owner puede invocar a esta funcion"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    //Registrar usuarios. Solo puede ser invocado por el propietario
    function registerUser(
        address _userAddress,
        string memory _username,
        string memory _role,
        string memory _password
    ) public onlyOwner {
        //Verifica que la cuenta y el nombre de usuario existan o no
        require(!users[_userAddress].exists, "La cuenta ya esta registrada");
        require(
            usernames[_username] == address(0),
            "El nombre de usuario ya existe"
        );
        require(
            isValidUsername(_username),
            "El formato del nombre de usuario no es correcto"
        );

        users[_userAddress] = User({
            username: _username,
            role: _role,
            passwordHash: keccak256(abi.encodePacked(_password)),
            exists: true
        });

        usernames[_username] = _userAddress;
        userAddresses.push(_userAddress);
        registeredUsers.push(
            RegisteredUser({
                username: _username,
                role: _role,
                userAddress: _userAddress
            })
        );

        emit UserRegistered(_userAddress, _username);
    }

    //Devuelve el nombre de usuario y el rol de un address
    function getUser(
        address _userAddress
    ) public view returns (string memory, string memory) {
        require(users[_userAddress].exists, "Usuario no encontrado");
        User memory user = users[_userAddress];
        return (user.username, user.role);
    }

    //Devuelve la direccion asociada a un nombre de usuario
    function getUsernameAddress(
        string memory _username
    ) public view returns (address) {
        return usernames[_username];
    }

    //Actualizar el rol del usuario
    function updateUserRole(
        address _userAddress,
        string memory _role
    ) public onlyOwner {
        require(users[_userAddress].exists, "Usuario no encontrado");
        users[_userAddress].role = _role;
        emit UserRoleUpdated(_userAddress, _role);
    }

    //Eliminar usuario
    function deleteUser(address _userAddress) public onlyOwner {
        require(users[_userAddress].exists, "Usuario no encontrado");

        string memory username = users[_userAddress].username;

        // Eliminar del mapping usernames
        delete usernames[username];

        // Eliminar del mapping users
        delete users[_userAddress];

        // Eliminar del array userAddresses
        for (uint i = 0; i < userAddresses.length; i++) {
            if (userAddresses[i] == _userAddress) {
                userAddresses[i] = userAddresses[userAddresses.length - 1];
                userAddresses.pop();
                break;
            }
        }

        // Eliminar del array registeredUsers
        for (uint i = 0; i < registeredUsers.length; i++) {
            if (registeredUsers[i].userAddress == _userAddress) {
                registeredUsers[i] = registeredUsers[
                    registeredUsers.length - 1
                ];
                registeredUsers.pop();
                break;
            }
        }

        emit UserDeleted(_userAddress);
    }

    //Obtener todos los usuarios registrados
    function getAllUsers()
        public
        view
        onlyOwner
        returns (RegisteredUser[] memory)
    {
        return registeredUsers;
    }

    //Verifica que el nombre de usuario tenga un numero limitado de caracteres y que sean solo alfanumericos
    function isValidUsername(
        string memory _username
    ) internal pure returns (bool) {
        bytes memory b = bytes(_username);
        if (b.length < 3 || b.length > 32) return false;
        for (uint i; i < b.length; i++) {
            bytes1 char = b[i];
            if (
                !(char >= 0x30 && char <= 0x39) && // 0-9
                !(char >= 0x41 && char <= 0x5A) && // A-Z
                !(char >= 0x61 && char <= 0x7A)
            ) {
                // a-z
                return false;
            }
        }
        return true;
    }

    //Verifica las credenciales del usuario
    function login(
        address _userAddress,
        string memory _password
    ) public view returns (address, string memory, string memory) {
        require(users[_userAddress].exists, "Usuario no encontrado");
        User memory user = users[_userAddress];
        bytes32 passwordHash = keccak256(abi.encodePacked(_password));
        require(user.passwordHash == passwordHash, "Contrasenia incorrecta");
        return (_userAddress, user.username, user.role);
    }
}
