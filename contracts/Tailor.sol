// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserStorage.sol";
import "./ProductManager.sol";

contract Tailor {

  /***************** ESTRUCTURAS Y ENUMS *****************/
  struct Garment {
    string name;
    uint256 quantity;
    address producer;
    uint256 price;
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

  modifier onlyClient() {
    string memory registeredUserRole = userStorageContract.getUserRole(
      msg.sender
    );
    require(
      Utils.compareStrings(registeredUserRole, "Cliente"),
      "No eres el cliente"
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
    require (productManagerContract.ownerOf(tokenId) == msg.sender && state == ProductManager.State.PENDIENTE, "No eres el propietario del token");
    _;
  }

  constructor(address _userStorageAddress, address _productManagerAddress) {
    userStorageContract = UserStorage(_userStorageAddress);
    productManagerContract = ProductManager(_productManagerAddress);
  }

  function addGarment(
    string memory name,
    uint256 quantity,
    uint256 price,
    uint256 fromTokenId
  ) external onlyTailor onlyLoggedUser {

    (address createdBy, , uint256 rawMaterialQuantity, string memory rawMaterialName, ProductManager.State state) = productManagerContract.traceabilityRecords(fromTokenId, productManagerContract.getLastTraceabilityRecordIndex(fromTokenId));
    require(state == ProductManager.State.ACEPTADO, "El token tiene que ser aceptado");

    productManagerContract.deleteUserToken(msg.sender, fromTokenId);

    productManagerContract.addTraceabilityRecord(
      fromTokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: createdBy,
        origin: fromTokenId,
        quantity: rawMaterialQuantity,
        productName: rawMaterialName,
        state: ProductManager.State.ELIMINADO
      }));

    productManagerContract.burn(fromTokenId);

    garmentId++;
    uint256 tokenId = productManagerContract.mint(msg.sender);

    productManagerContract.addTraceabilityRecord(
      tokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: msg.sender,
        origin: fromTokenId,
        quantity: quantity,
        productName: name,
        state: ProductManager.State.CREADO
      }));

    garments[tokenId] = Garment(name, quantity, msg.sender, price);
    productManagerContract.setIndex(tokenId, msg.sender);
    productManagerContract.addUserProduct(tokenId, msg.sender); // Almacenar tokenId del producto para el usuario
  }

  function setGarmentForSale(uint256 tokenId) external onlyTailor onlyLoggedUser {
    (address createdBy, uint256 origin, uint256 quantity, string memory productName, ProductManager.State state) = productManagerContract.traceabilityRecords(tokenId, productManagerContract.getLastTraceabilityRecordIndex(tokenId));
    require(state == ProductManager.State.CREADO, "El token no ha sido creado");

    productManagerContract.addProductForSale(tokenId, msg.sender);

    productManagerContract.addTraceabilityRecord(
      tokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: createdBy,
        origin: origin,
        quantity: quantity,
        productName: productName,
        state: ProductManager.State.VENTA
      }));
  }

  function buyToken(uint256 tokenId) external payable onlyClient onlyLoggedUser {
    (address tailorAddress, uint256 origin, uint256 quantity, string memory productName, ProductManager.State state) = productManagerContract.traceabilityRecords(tokenId, productManagerContract.getLastTraceabilityRecordIndex(tokenId));

    require(state == ProductManager.State.VENTA, "El token no esta en venta");
    require(msg.value >= garments[tokenId].price, "No dispone de fondos suficientes");

    (address manufacturerAddress, , , , ) = productManagerContract.traceabilityRecords(origin, productManagerContract.getLastTraceabilityRecordIndex(origin));

    payable(manufacturerAddress).transfer(
      garments[tokenId].price / 5
    );

    payable(tailorAddress).transfer(
      garments[tokenId].price - (garments[tokenId].price / 5)
    );

    productManagerContract.transferToken(msg.sender, tailorAddress, tokenId);
    productManagerContract.deleteProductForSale(tokenId, msg.sender);

    productManagerContract.addTraceabilityRecord(
      tokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: tailorAddress,
        origin: origin,
        quantity: quantity,
        productName: productName,
        state: ProductManager.State.COMPRADO
      }));
  }

  function accept(uint256 tokenId) external onlyLoggedUser onlyTokenOwner(tokenId) {
    (address createdBy, uint256 origin, uint256 quantity, string memory productName, ) = productManagerContract.traceabilityRecords(tokenId, productManagerContract.getLastTraceabilityRecordIndex(tokenId));

    productManagerContract.addTraceabilityRecord(
      tokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: createdBy,
        origin: origin,
        quantity: quantity,
        productName: productName,
        state: ProductManager.State.ACEPTADO
      }));
  }

  function reject(uint256 tokenId) external onlyLoggedUser onlyTokenOwner(tokenId) {
    (address createdBy, uint256 origin, uint256 quantity, string memory productName, ) = productManagerContract.traceabilityRecords(tokenId, productManagerContract.getLastTraceabilityRecordIndex(tokenId));
    productManagerContract.safeTransferFrom(createdBy, msg.sender, tokenId);

    productManagerContract.addTraceabilityRecord(
      tokenId, 
      ProductManager.TraceabilityRecord({
        createdBy: createdBy,
        origin: origin,
        quantity: quantity,
        productName: productName,
        state: ProductManager.State.RECHAZADO
      }));
  }

  function getGarment(
    uint256 _tokenId,
    address _userAddress
  ) external view returns (string memory, uint256, uint256) {
    require(
      productManagerContract.ownerOf(_tokenId) == _userAddress,
      "No eres el propietario"
    );

    Garment memory garment = garments[_tokenId];
    return (garment.name, garment.quantity, garment.price);
  }

  function getAllUserTokens(
    address user
  ) external view returns (uint256[] memory) {
    return productManagerContract.getAllUserTokens(user);
  }

  function getTokenTraceabilityById(uint256 tokenId) external view returns (ProductManager.TraceabilityRecord[] memory) {
    return productManagerContract.getTokenTraceabilityById(tokenId);
  }

  function getAllTokensIdsForSale(address user) external view returns (uint256[] memory) {
    return productManagerContract.getAllTokensIdsForSale(user);
  }
}