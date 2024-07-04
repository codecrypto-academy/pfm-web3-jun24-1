// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SupplyChain {
    using SafeMath for uint256;

    enum Material {
        Cotton,
        Silk,
        Linen
    }

    enum State {
        Production,
        Transfer,
        Manufacturing,
        Purchase
    }

    enum ItemType {
        RawMaterial,
        Garment
    }

    struct RawMaterial {
        Material material;
        uint256 quantity; // en kilogramos
        uint256 productionDate;
        uint256 price; // precio del material en wei (equivalente a ETH)
        address producer;
    }

    struct Garment {
        string name;
        uint256 cottonAmount;
        uint256 silkAmount;
        uint256 linenAmount;
        uint256 price; // precio del producto en wei (equivalente a ETH)
        bool forSale;
        uint256 productionDate;
        address tailor;
        uint256[] rawMaterialIds;
    }

    struct TraceabilityRecord {
        uint256 timestamp;
        State state;
        address actor;
        string details;
        ItemType itemType;
        uint256 itemId;
    }

    address public manufacturer;
    address public tailor;

    mapping(uint256 => RawMaterial) public rawMaterials;
    mapping(address => uint256[]) public rawMaterialsByManufacturer; // Materiales crudos por fabricante

    Garment[] public garments;

    // Registro de trazabilidad unificado
    mapping(uint256 => TraceabilityRecord[]) public traceabilityRecords;
    uint256 public traceabilityCount = 1;

    event RawMaterialProduced(uint256 materialId, Material material, uint256 quantity, uint256 price);
    event RawMaterialSent(uint256 materialId, Material material, uint256 quantity, address tailor);
    event GarmentProduced(uint256 garmentId, string name, uint256 price);
    event GarmentPurchased(uint256 garmentId, address buyer);

    modifier onlyManufacturer() {
        require(msg.sender == manufacturer, "Solo el fabricante puede llamar a esta funcion");
        _;
    }

    modifier onlyTailor() {
        require(msg.sender == tailor, "Solo el confeccionista puede llamar a esta funcion");
        _;
    }

    constructor(address _tailor) {
        manufacturer = msg.sender;
        tailor = _tailor;
    }

    function addTraceabilityRecord(State state, string memory details, ItemType itemType, uint256 itemId) internal {
        TraceabilityRecord memory record = TraceabilityRecord(
            block.timestamp,
            state,
            msg.sender,
            details,
            itemType,
            itemId
        );
        traceabilityRecords[traceabilityCount].push(record);
        traceabilityCount++;
    }

    function produceRawMaterial(Material material, uint256 quantityInKg, uint256 priceInEth) public onlyManufacturer {
        uint256 materialId = rawMaterialsByManufacturer[msg.sender].length;
        rawMaterialsByManufacturer[msg.sender].push(materialId);

        uint256 priceInWei = priceInEth * 1 ether; // Convertir de ETH a wei

        rawMaterials[materialId] = RawMaterial(material, quantityInKg, block.timestamp, priceInWei, msg.sender);

        addTraceabilityRecord(
            State.Production,
            string(abi.encodePacked("Produced ", uintToString(quantityInKg), " kg of ", _materialToString(material))),
            ItemType.RawMaterial,
            materialId
        );

        emit RawMaterialProduced(materialId, material, quantityInKg, priceInWei);
    }

    function sendRawMaterialToTailor(uint256 materialId, uint256 quantityInKg) public onlyManufacturer {
        require(rawMaterials[materialId].quantity >= quantityInKg, "Material insuficiente");

        rawMaterials[materialId].quantity = rawMaterials[materialId].quantity.sub(quantityInKg);

        addTraceabilityRecord(
            State.Transfer,
            string(abi.encodePacked("Enviado ", uintToString(quantityInKg), " kg de ", _materialToString(rawMaterials[materialId].material), " al sastre")),
            ItemType.RawMaterial,
            materialId
        );

        emit RawMaterialSent(materialId, rawMaterials[materialId].material, quantityInKg, tailor);
    }

    function produceGarment(string memory name, uint256[] memory materialIds, uint256[] memory amounts, uint256 priceInEth) public onlyTailor {
        require(materialIds.length == 3, "Debe proporcionar 3 materiales");
        require(amounts.length == 3, "Debe proporcionar 3 cantidades");

        uint256 priceInWei = priceInEth * 1 ether; // Convertir de ETH a wei

        for (uint256 i = 0; i < 3; i++) {
            require(rawMaterials[materialIds[i]].quantity >= amounts[i], "Material crudo insuficiente");
            rawMaterials[materialIds[i]].quantity = rawMaterials[materialIds[i]].quantity.sub(amounts[i]);
        }

        uint256 garmentId = garments.length;
        garments.push(Garment(name, amounts[0], amounts[1], amounts[2], priceInWei, true, block.timestamp, msg.sender, materialIds));

        addTraceabilityRecord(
            State.Manufacturing,
            string(abi.encodePacked("Se produjo la prenda ", name)),
            ItemType.Garment,
            garmentId
        );

        emit GarmentProduced(garmentId, name, priceInWei);
    }

    function purchaseGarment(uint256 garmentId) public payable {
        require(garmentId < garments.length, "ID de prenda invalido");
        require(garments[garmentId].forSale, "Prenda no esta a la venta");
        require(msg.value >= garments[garmentId].price, "Pago insuficiente");

        garments[garmentId].forSale = false;

        addTraceabilityRecord(
            State.Purchase,
            string(abi.encodePacked("Se compro la prenda ", garments[garmentId].name)),
            ItemType.Garment,
            garmentId
        );

        emit GarmentPurchased(garmentId, msg.sender);

        payable(tailor).transfer(msg.value);
    }

    function getRawMaterialsByManufacturer(address _manufacturer) public view returns (uint256[] memory) {
        return rawMaterialsByManufacturer[_manufacturer];
    }

    function getGarmentCount() public view returns (uint256) {
        return garments.length;
    }

    function getTraceability(uint256 recordId) public view returns (TraceabilityRecord[] memory) {
        return traceabilityRecords[recordId];
    }

    function _materialToString(Material material) internal pure returns (string memory) {
        if (material == Material.Cotton) {
            return "Algodon";
        } else if (material == Material.Silk) {
            return "Seda";
        } else if (material == Material.Linen) {
            return "Lino";
        } else {
            revert("Tipo de material invalido");
        }
    }

    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
