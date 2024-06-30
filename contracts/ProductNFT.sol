// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract ProductNFT is ERC721Enumerable {
    uint256 private tokenIdCounter;

    constructor() ERC721("ProductNFT", "PNFT") {}

    function mint(address to) external returns (uint256) {
        tokenIdCounter++;
        _safeMint(to, tokenIdCounter);
        return tokenIdCounter;
    }
}
