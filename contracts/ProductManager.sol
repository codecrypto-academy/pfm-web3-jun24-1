
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ProductManager is ERC721, ERC721Enumerable, ERC721Burnable {
    struct Product {
        string name;
        uint256 quantity;
    }

    mapping(uint256 => Product) private products;
    mapping(address => uint256[]) private userProducts; // Mapping para almacenar los tokenIds de un usuario
    uint256 private productId;
    uint256 private tokenIdCounter;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "No eres el propietario");
        _;
    }

    constructor() ERC721("ProductNFT", "PNFT") {
        owner = msg.sender; // El deployer de ProductManager se convierte en el owner
    }

    function mint(address to) external returns (uint256) {
        tokenIdCounter++;
        super._safeMint(to, tokenIdCounter);
        return tokenIdCounter;
    }

    function addProduct(
        string memory name,
        uint256 quantity
    ) external onlyOwner {
        productId++;
        uint256 tokenId = this.mint(msg.sender);
        products[tokenId] = Product(name, quantity);
        userProducts[msg.sender].push(tokenId); // Almacenar tokenId del producto para el usuario
    }

    function getUserProducts(
        address user
    ) external view returns (uint256[] memory) {
        return userProducts[user];
    }

    function getProduct(
        uint256 tokenId
    ) external view returns (string memory, uint256) {
        require(
            super.ownerOf(tokenId) == msg.sender,
            "No eres el propietario"
        );

        Product memory product = products[tokenId];
        return (product.name, product.quantity);
    }

    function getAllUserTokens(
        address user
    ) external view returns (uint256[] memory) {
        uint256 tokenCount = super.balanceOf(user);
        uint256[] memory tokenIds = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = super.tokenOfOwnerByIndex(user, i);
        }

        return tokenIds;
    }

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

     function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
