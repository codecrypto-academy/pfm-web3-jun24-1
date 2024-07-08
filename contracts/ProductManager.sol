// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "./UserStorage.sol";

contract ProductManager is ERC721, ERC721Enumerable, ERC721Burnable {
  
  /***************** ESTRUCTURAS Y ENUMS *****************/
  struct Product {
    string name;
    uint256 quantity;
    address producer;
  }

  struct TraceabilityRecord {
    address createdBy;
    uint256 origin;
    uint256 quantity;
    string productName;
    State state;
  }

  enum State {
    NEW,
    TRANSFERED,
    ACCEPTED,
    REJECTED,
    BURNED,
    ONSALE,
    PURCHASED
  }

  /***************** VARIABLES *****************/
  mapping(uint256 => Product) private products;
  mapping(address => uint256[]) public userProducts; // Mapping para almacenar los tokenIds de un usuario
  mapping(uint256 => TraceabilityRecord[]) public traceabilityRecords;
  mapping(uint256 => uint8) private index;

  uint256 private productId;
  uint256 private tokenIdCounter;
  address public owner;

  UserStorage private userStorageContract;

  /***************** MODIFICADORES *****************/
  modifier onlyManufacturer() {
    string memory registeredUserRole = userStorageContract.getUserRole(
      msg.sender
    );
    require(
      compareStrings(registeredUserRole, "Fabricante"),
      "No eres el fabricante"
    );
    _;
  }

  modifier onlyTailor() {
    string memory registeredUserRole = userStorageContract.getUserRole(
      msg.sender
    );
    require(
      compareStrings(registeredUserRole, "Confeccionista"),
      "No eres el confeccionista"
    );
    _;
  }

  modifier onlyClient() {
    string memory registeredUserRole = userStorageContract.getUserRole(
      msg.sender
    );
    require(
      compareStrings(registeredUserRole, "Cliente"),
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
    require (super._ownerOf(tokenId) == msg.sender && traceabilityRecords[tokenId][getLastTraceabilityRecordIndex(tokenId)].state == State.TRANSFERED, "No eres el propietario del token");
    _;
  }

  /***************** CONSTRUCTOR *****************/
  constructor(address _userStorageAddress) ERC721("ProductNFT", "PNFT") {
    userStorageContract = UserStorage(_userStorageAddress);
    owner = msg.sender; // El deployer de ProductManager se convierte en el owner
  }

  /***************** FUNCIONES *****************/
  function mint(address to) external returns (uint256) {
    tokenIdCounter++;
    super._safeMint(to, tokenIdCounter);
    return tokenIdCounter;
  }

  function addProduct(
    string memory name,
    uint256 quantity
  ) external onlyManufacturer onlyLoggedUser {

    productId++;
    uint256 tokenId = this.mint(msg.sender);

    traceabilityRecords[tokenId].push(
      TraceabilityRecord({
        createdBy: msg.sender,
        origin: tokenId,
        quantity: quantity,
        productName: name,
        state: State.NEW
      }));

    products[tokenId] = Product(name, quantity, msg.sender);
    index[tokenId] = uint8(userProducts[msg.sender].length);
    userProducts[msg.sender].push(tokenId); // Almacenar tokenId del producto para el usuario
  }

  function addGarment(
    string memory name,
    uint256 quantity,
    uint256 fromTokenId
  ) external onlyTailor onlyLoggedUser {

    require(traceabilityRecords[fromTokenId][getLastTraceabilityRecordIndex(fromTokenId)].state == State.ACCEPTED, "El token tiene que ser aceptado");

    delete userProducts[msg.sender][index[fromTokenId]];

    traceabilityRecords[fromTokenId].push(
      TraceabilityRecord({
        createdBy: msg.sender,
        origin: fromTokenId,
        quantity: quantity,
        productName: name,
        state: State.BURNED
      }));

    _burn(fromTokenId);

    productId++;
    uint256 tokenId = this.mint(msg.sender);

    traceabilityRecords[tokenId].push(
      TraceabilityRecord({
        createdBy: msg.sender,
        origin: fromTokenId,
        quantity: quantity,
        productName: name,
        state: State.NEW
      }));

    products[tokenId] = Product(name, quantity, msg.sender);
    index[tokenId] = uint8(userProducts[msg.sender].length);
    userProducts[msg.sender].push(tokenId); // Almacenar tokenId del producto para el usuario
  }

  function safeTransferFrom(address to, address from, uint256 tokenId) public virtual override(IERC721, ERC721) {
    _transfer(from, to, tokenId);
    delete userProducts[from][index[tokenId]];
    index[tokenId] = uint8(userProducts[to].length);
    userProducts[to].push(tokenId);
  }

  function transferToTailor(address tailor, uint256 tokenId) external onlyManufacturer onlyLoggedUser {
    safeTransferFrom(tailor, msg.sender, tokenId);
    TraceabilityRecord memory traceabilityRecord = traceabilityRecords[tokenId][getLastTraceabilityRecordIndex(tokenId)];

    traceabilityRecords[tokenId].push(
      TraceabilityRecord({
        createdBy: traceabilityRecord.createdBy,
        origin: traceabilityRecord.origin,
        quantity: traceabilityRecord.quantity,
        productName: traceabilityRecord.productName,
        state: State.TRANSFERED
      }));
  } 

  function accept (uint256 tokenId) external onlyTokenOwner(tokenId) {
    TraceabilityRecord memory traceabilityRecord = traceabilityRecords[tokenId][getLastTraceabilityRecordIndex(tokenId)];

    traceabilityRecords[tokenId].push(
      TraceabilityRecord({
        createdBy: traceabilityRecord.createdBy,
        origin: traceabilityRecord.origin,
        quantity: traceabilityRecord.quantity,
        productName: traceabilityRecord.productName,
        state: State.ACCEPTED
      }));
  }

  function reject (uint256 tokenId) external onlyTokenOwner(tokenId) {
    safeTransferFrom(traceabilityRecords[tokenId][getLastTraceabilityRecordIndex(tokenId)].createdBy, msg.sender, tokenId);

    TraceabilityRecord memory traceabilityRecord = traceabilityRecords[tokenId][getLastTraceabilityRecordIndex(tokenId)];

    traceabilityRecords[tokenId].push(
      TraceabilityRecord({
        createdBy: traceabilityRecord.createdBy,
        origin: traceabilityRecord.origin,
        quantity: traceabilityRecord.quantity,
        productName: traceabilityRecord.productName,
        state: State.REJECTED
      }));
  }

  function getUserProducts(
    address user
  ) external view returns (uint256[] memory) {
    return userProducts[user];
  }

  function getProduct(
    uint256 _tokenId,
    address _userAddress
  ) external view returns (string memory, uint256) {
    require(
      super.ownerOf(_tokenId) == _userAddress,
      "No eres el propietario"
    );

    Product memory product = products[_tokenId];
    return (product.name, product.quantity);
  }

  function getAllUserTokens(
    address user
  ) external view returns (uint256[] memory) {
    // uint256 tokenCount = super.balanceOf(user);
    // uint256[] memory tokenIds = new uint256[](tokenCount);

    // for (uint256 i = 0; i < tokenCount; i++) {
    //   tokenIds[i] = super.tokenOfOwnerByIndex(user, i);
    // }

    return userProducts[user];
  }

  function getTokenTraceabilityById(uint256 tokenId) external view returns (TraceabilityRecord[] memory) {
    return traceabilityRecords[tokenId];
  }

  function compareStrings(
    string memory a,
    string memory b
  ) public pure returns (bool) {
    return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
  }

  function getLastTraceabilityRecordIndex(uint256 tokenId) public view returns (uint256) {      
    return traceabilityRecords[tokenId].length - 1;
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
