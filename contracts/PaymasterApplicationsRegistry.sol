// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymasterApplicationsRegistry {
    struct Paymaster {
        bool isActive;
        bytes paymasterMetadataCID;
        mapping(address => bool) applications;
        address owner;
    }

    mapping(address => Paymaster) public paymastersMap;

    event PaymasterRegistered(
        address indexed paymasterAddress,
        bytes paymasterMetadataCID
    );
    event PaymasterUnregistered(address indexed paymasterAddress);

    event ApplicationAdded(
        address indexed paymasterAddress,
        address indexed applicationAddress
    );
    event ApplicationRemoved(
        address indexed paymasterAddress,
        address indexed applicationAddress
    );

    modifier onlyPaymasterOwner(address paymasterAddress) {
        require(
            paymastersMap[paymasterAddress].owner == msg.sender,
            "Not the paymaster owner"
        );
        _;
    }

    function registerPaymaster(
        address _paymasterAddress,
        bytes calldata _paymasterMetadataCID
    ) external {
        require(_paymasterAddress != address(0), "Invalid paymaster address");
        require(
            !paymastersMap[_paymasterAddress].isActive,
            "Paymaster already registered"
        );

        Paymaster storage paymaster = paymastersMap[_paymasterAddress];
        paymaster.isActive = true;
        paymaster.owner = msg.sender;
        paymaster.paymasterMetadataCID = _paymasterMetadataCID;
        emit PaymasterRegistered(_paymasterAddress, _paymasterMetadataCID);
    }

    function unregisterPaymaster(
        address paymasterAddress
    ) external onlyPaymasterOwner(paymasterAddress) {
        require(paymasterAddress != address(0), "Invalid paymaster address");
        require(
            paymastersMap[paymasterAddress].isActive,
            "Paymaster not registered"
        );

        delete paymastersMap[paymasterAddress];
        emit PaymasterUnregistered(paymasterAddress);
    }

    function addApplicationToPaymaster(
        address paymasterAddress,
        address applicationAddress
    ) external onlyPaymasterOwner(paymasterAddress) {
        require(paymasterAddress != address(0), "Invalid paymaster address");
        require(
            paymastersMap[paymasterAddress].isActive,
            "Paymaster not registered"
        );
        require(
            applicationAddress != address(0),
            "Invalid application address"
        );

        Paymaster storage paymaster = paymastersMap[paymasterAddress];
        paymaster.applications[applicationAddress] = true;
        emit ApplicationAdded(paymasterAddress, applicationAddress);
    }

    function removeApplicationFromPaymaster(
        address paymasterAddress,
        address applicationAddress
    ) external onlyPaymasterOwner(paymasterAddress) {
        require(paymasterAddress != address(0), "Invalid paymaster address");
        require(
            paymastersMap[paymasterAddress].isActive,
            "Paymaster not registered"
        );
        require(
            applicationAddress != address(0),
            "Invalid application address"
        );

        Paymaster storage paymaster = paymastersMap[paymasterAddress];
        paymaster.applications[applicationAddress] = false;
        emit ApplicationRemoved(paymasterAddress, applicationAddress);
    }

    function isApplicationSupported(
        address paymasterAddress,
        address applicationAddress
    ) external view returns (bool) {
        require(paymasterAddress != address(0), "Invalid paymaster address");
        require(
            paymastersMap[paymasterAddress].isActive,
            "Paymaster not registered"
        );
        return paymastersMap[paymasterAddress].applications[applicationAddress];
    }
}
