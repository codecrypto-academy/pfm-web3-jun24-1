// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "./UserStorage.sol";
import "./Utils.sol";

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
    CREADO,
    PENDIENTE,
    ACEPTADO,
    RECHAZADO,
    ELIMINADO,
    VENTA,
    COMPRADO
  }

  /***************** VARIABLES *****************/
  mapping(uint256 => Product) private products;
  mapping(address => uint256[]) public userProducts; // Mapping para almacenar los tokenIds de un usuario
  mapping(address => uint256[]) public userProductsForSale; // Mapping para almacenar los tokenIds en venta de un usuario
  mapping(uint256 => TraceabilityRecord[]) public traceabilityRecords;
  mapping(uint256 => uint8) public index;

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
      Utils.compareStrings(registeredUserRole, "Fabricante"),
      "No eres el fabricante"
    );
    _;
  }    

  modifier onlyLoggedUser() {
    (, , bool logged) = userStorageContract.getUser(msg.sender);
    require(logged, "Este usuario no ha iniciado sesion");
    _;
  }

  modifier onlyTokenOwner(uint256 tokenId) {    
    require (super._ownerOf(tokenId) == msg.sender && traceabilityRecords[tokenId][getLastTraceabilityRecordIndex(tokenId)].state == State.PENDIENTE, "No eres el propietario del token");
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
        state: State.CREADO
      }));

    products[tokenId] = Product(name, quantity, msg.sender);
    index[tokenId] = uint8(userProducts[msg.sender].length);
    userProducts[msg.sender].push(tokenId); // Almacenar tokenId del producto para el usuario
  }

  function safeTransferFrom(address to, address from, uint256 tokenId) public virtual override(IERC721, ERC721) {
    _transfer(from, to, tokenId);
    deleteUserToken(from, tokenId);
    index[tokenId] = uint8(userProducts[to].length);
    userProducts[to].push(tokenId);
  }

  function transferToken(address to, address from, uint256 tokenId) external {
    _transfer(from, to, tokenId);
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
        state: State.PENDIENTE
      }));
  }

  function burn(uint256 tokenId) public virtual override {
    _burn(tokenId);
  }

    function getProduct(
        uint256 _tokenId,
        address _userAddress
    ) external view returns (string memory, uint256, State) {
        TraceabilityRecord memory lastRecord = traceabilityRecords[_tokenId][
            getLastTraceabilityRecordIndex(_tokenId)
        ];

        // Verifica que el mensaje provenga del propietario o del fabricante y que el estado sea "Pendiente"
        require(
            super.ownerOf(_tokenId) == _userAddress ||
                (msg.sender == super.ownerOf(_tokenId) &&
                    lastRecord.state == State.PENDIENTE),
            "No tienes permiso para ver este token"
        );

        Product memory product = products[_tokenId];
        State state = lastRecord.state;
        return (product.name, product.quantity, state);
    }

  function getAllUserTokens(
    address user
  ) public view returns (uint256[] memory) {
    return userProducts[user];
  }

  function getTokenTraceabilityById(uint256 tokenId) public view returns (TraceabilityRecord[] memory) {
    return traceabilityRecords[tokenId];
  }

  function getLastTraceabilityRecordIndex(uint256 tokenId) public view returns (uint256) {      
    return traceabilityRecords[tokenId].length - 1;
  }

  function deleteUserToken(address user, uint256 tokenId) public {
    delete userProducts[user][index[tokenId]];
  }

  function getIndex(uint256 tokenId) public view returns (uint256) {
    return index[tokenId];
  }

  function setIndex(uint256 tokenId, address user) public {
    index[tokenId] = uint8(userProducts[user].length);
  }

  function addTraceabilityRecord(uint256 tokenId, TraceabilityRecord calldata record) public {
    traceabilityRecords[tokenId].push(record);
  }

  function addUserProduct(uint256 tokenId, address user) public {
    userProducts[user].push(tokenId);
  }

  function getTraceabilityRecord(uint256 _tokenId, uint256 _index) public view returns (TraceabilityRecord memory) {
    return traceabilityRecords[_tokenId][_index];
  }

  function addProductForSale(uint256 tokenId, address user) public {
    deleteUserToken(user, tokenId);
    index[tokenId] = uint8(userProductsForSale[user].length);
    userProductsForSale[user].push(tokenId);
  }

  function deleteProductForSale(uint256 tokenId, address tailor, address client) public {
    delete userProductsForSale[tailor][index[tokenId]];
    index[tokenId] = uint8(userProducts[client].length);
    userProducts[client].push(tokenId);
  }

  function getAllTokensIdsForSale(address user) external view returns (uint256[] memory) {
    return userProductsForSale[user];
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
