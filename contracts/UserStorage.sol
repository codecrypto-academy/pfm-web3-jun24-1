// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserStorage {
    struct User {
        string username;
        string role;
        string password;
    }

    mapping(address => User) public users;

    event UserRegistered(address indexed account, string username, string role);

    function registerUser(string memory username, string memory role, string memory password) public {
        require(bytes(username).length > 0, "El nombre de usuario no puede estar vacio");
        require(bytes(role).length > 0, "El rol no puede estar vacio");
        require(bytes(password).length > 0, "La contrasenia no puede estar vacia");

        users[msg.sender] = User(username, role, password);
        emit UserRegistered(msg.sender, username, role);
    }

    function getUser(address account) public view returns (string memory, string memory, string memory) {
        User memory user = users[account];
        return (user.username, user.role, user.password);
    }
}