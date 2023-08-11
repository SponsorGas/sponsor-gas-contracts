// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StakingContract {
    address public admin;
    uint256 public stakingAmount = 0.006 ether;

    mapping(address => uint256) public stakedAmounts;

    event Stake(address indexed staker, uint256 amount);
    event Withdrawal(address indexed staker, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function setStakingAmount(uint256 amount) public onlyAdmin {
        stakingAmount = amount;
    }

    function stake() public payable {
        require(msg.value == stakingAmount, "Incorrect staking amount");
        stakedAmounts[msg.sender] += msg.value;
        emit Stake(msg.sender, msg.value);
    }

    function withdraw() public {
        require(stakedAmounts[msg.sender] > 0, "No stake available");

        uint256 amount = stakedAmounts[msg.sender];
        stakedAmounts[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit Withdrawal(msg.sender, amount);
    }
}
