// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "./UserStorage.sol";
import "./ProductManager.sol";
import "./Utils.sol";

contract Tailor is ERC721, ERC721Enumerable, ERC721Burnable {

  /***************** ESTRUCTURAS Y ENUMS *****************/
  struct Garment {
    string name;
    uint256 quantity;
    address producer;
    uint256 price;
    bool forSale;
  }

  /***************** VARIABLES *****************/
  mapping(uint256 => Garment) private garments;
  uint256 private garmentId;

  UserStorage private userStorageContract;
  ProductManager private productManagerContract;

  /***************** MODIFICADORES *****************/
  modifier onlyTailor() {
    string memory registeredUserRole = userStorageContract.getUserRole(
      msg.sender
    );
    require(
      Utils.compareStrings(registeredUserRole, "Confeccionista"),
      "No eres el confeccionista"
    );
    _;
  }

  modifier onlyLoggedUser() {
    (, , bool logged) = userStorageContract.getUser(msg.sender);
    require(logged, "Este usuario no ha iniciado sesion");
    _;
  }

  modifier onlyTokenOwner(uint256 tokenId) {
    (, , , , ProductManager.State state) = productManagerContract.traceabilityRecords(tokenId, productManagerContract.getLastTraceabilityRecordIndex(tokenId));
    require (ownerOf(tokenId) == msg.sender && state == ProductManager.State.Pendiente, "No eres el propietario del token");
    _;
  }

  constructor(address _userStorageAddress, address _productManagerAddress) ERC721("ProductNFT", "PNFT") {
    userStorageContract = UserStorage(_userStorageAddress);
    productManagerContract = ProductManager(_productManagerAddress);
  }

  function addGarment(
    string memory name,
    uint256 quantity,
    uint256 price,
    uint256 fromTokenId
  ) external onlyTailor onlyLoggedUser {

    (, , , , ProductManager.State state) = productManagerContract.traceabilityRecords(fromTokenId, productManagerContract.getLastTraceabilityRecordIndex(fromTokenId));
    require(state == ProductManager.State.Aceptado, "El token tiene que ser aceptado");

    productManagerContract.deleteUserToken(msg.sender, fromTokenId);

    productManagerContract.addTraceabilityRecord(
      fromTokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: msg.sender,
        origin: fromTokenId,
        quantity: quantity,
        productName: name,
        state: ProductManager.State.Eliminado
      }));

    _burn(fromTokenId);

    garmentId++;
    uint256 tokenId = productManagerContract.mint(msg.sender);

    productManagerContract.addTraceabilityRecord(
      tokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: msg.sender,
        origin: fromTokenId,
        quantity: quantity,
        productName: name,
        state: ProductManager.State.Eliminado
      }));

    garments[tokenId] = Garment(name, quantity, msg.sender, price, false);
    productManagerContract.setIndex(tokenId, msg.sender);
    productManagerContract.addUserProduct(tokenId, msg.sender); // Almacenar tokenId del producto para el usuario
  }

  function acceptProduct(uint256 tokenId) external onlyTokenOwner(tokenId) {
    (address createdBy, uint256 origin, uint256 quantity, string memory productName, ) = productManagerContract.traceabilityRecords(tokenId, productManagerContract.getLastTraceabilityRecordIndex(tokenId));

    productManagerContract.addTraceabilityRecord(
      tokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: createdBy,
        origin: origin,
        quantity: quantity,
        productName: productName,
        state: ProductManager.State.Aceptado
      }));
  }

  function rejectProduct(uint256 tokenId) external onlyTokenOwner(tokenId) {
    (address createdBy, uint256 origin, uint256 quantity, string memory productName, ) = productManagerContract.traceabilityRecords(tokenId, productManagerContract.getLastTraceabilityRecordIndex(tokenId));
    safeTransferFrom(createdBy, msg.sender, tokenId);

    productManagerContract.addTraceabilityRecord(
      tokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: createdBy,
        origin: origin,
        quantity: quantity,
        productName: productName,
        state: ProductManager.State.Rechazado
      }));
  }

  function getGarment(
    uint256 _tokenId,
    address _userAddress
  ) external view returns (string memory, uint256, uint256, bool) {
    require(
      super.ownerOf(_tokenId) == _userAddress,
      "No eres el propietario"
    );

    Garment memory garment = garments[_tokenId];
    return (garment.name, garment.quantity, garment.price, garment.forSale);
  }

  function getAllUserTokens(
    address user
  ) external view returns (uint256[] memory) {
    return productManagerContract.getAllUserTokens(user);
  }

  function getTokenTraceabilityById(uint256 tokenId) external view returns (ProductManager.TraceabilityRecord[] memory) {
    return productManagerContract.getTokenTraceabilityById(tokenId);
  }











  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 firstTokenId,
    uint256 batchSize
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}