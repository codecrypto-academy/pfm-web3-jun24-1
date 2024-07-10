// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserStorage {
    struct User {
        string username;
        string role;
        bytes32 passwordHash;
        bool exists;
        bool logged;
    }

    struct RegisteredUser {
        string username;
        string role;
        address userAddress;
    }

    mapping(address => User) private users;
    mapping(string => address) private usernames;
    address[] private userAddresses;
    RegisteredUser[] private registeredUsers;
    address public owner;

    event UserRegistered(address indexed userAddress, string username);
    event UserRoleUpdated(address indexed userAddress, string role);
    event UserDeleted(address indexed userAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el Owner puede invocar a esta funcion");
        _;
    }

    modifier existsUser(address _userAddress) {
        require(users[_userAddress].exists, "Usuario no encontrado");
        _;
    }

    modifier onlyLoggedUser(address _userAddress) {
        require(users[_userAddress].logged, "Este usuario no ha iniciado sesion");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerUser(address _userAddress, string memory _username, string memory _role, string memory _password) public onlyOwner {
        require(!users[_userAddress].exists, "La cuenta ya esta registrada");
        require(usernames[_username] == address(0), "El nombre de usuario ya existe");
        require(isValidUsername(_username), "El formato del nombre de usuario no es correcto");

        users[_userAddress] = User({
            username: _username,
            role: _role,
            passwordHash: keccak256(abi.encodePacked(_password)),
            exists: true,
            logged: false
        });

        usernames[_username] = _userAddress;
        userAddresses.push(_userAddress);
        registeredUsers.push(RegisteredUser({
            username: _username,
            role: _role,
            userAddress: _userAddress
        }));

        emit UserRegistered(_userAddress, _username);
    }

    function getUser(address _userAddress) public view existsUser(_userAddress) returns (string memory, string memory, bool) {
        User memory user = users[_userAddress];
        return (user.username, user.role, user.logged);
    }

    function getUsernameAddress(string memory _username) public view returns (address) {
        return usernames[_username];
    }

    function updateUserRole(address _userAddress, string memory _role) public onlyOwner existsUser(_userAddress) {
        users[_userAddress].role = _role;
        emit UserRoleUpdated(_userAddress, _role);
    }

    function deleteUser(address _userAddress) public onlyOwner existsUser(_userAddress) {
        string memory username = users[_userAddress].username;
        delete usernames[username];
        delete users[_userAddress];
        emit UserDeleted(_userAddress);
    }

    function getAllUsers() public view returns (RegisteredUser[] memory)  {
        return registeredUsers;
    }

    function isValidUsername(string memory _username) internal pure returns (bool) {
        bytes memory b = bytes(_username);
        if (b.length < 3 || b.length > 32) return false;
        for (uint i; i < b.length; i++) {
            bytes1 char = b[i];
            if (!(char >= 0x30 && char <= 0x39) && // 0-9
                !(char >= 0x41 && char <= 0x5A) && // A-Z
                !(char >= 0x61 && char <= 0x7A)) { // a-z
                return false;
            }
        }
        return true;
    }

    function login(address _userAddress, string memory _password) public existsUser(_userAddress) {
        bytes32 passwordHash = keccak256(abi.encodePacked(_password));
        require(users[_userAddress].passwordHash == passwordHash, "Contrasenia incorrecta");
        users[_userAddress].logged = true;
    }

    function logout(address _userAddress) public onlyLoggedUser(_userAddress) {        
        users[_userAddress].logged = false;
    }

    function getLoggedUser(address _userAddress) public view returns (address, string memory, string memory) {
        return (_userAddress, users[_userAddress].username, users[_userAddress].role);
    }

    function getUserRole(address _userAddress) public view existsUser(_userAddress) returns (string memory) {
        return users[_userAddress].role;
    }
}