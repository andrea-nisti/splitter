pragma solidity ^0.4.23;

/**
 * The Splitter contract  splits amount of ether between two people */
contract 
Splitter {

	mapping (address => uint) public  amounts;
	address public _owner;

	
	//Mods
	modifier  onlyOwner{ 
		require (msg.sender == _owner); 
		_; 
	}
/*
	modifier isActive(uint _time) { 
		require (now >= _time); 
		_; 
	}
*/	
	
	constructor() public {
		_owner = msg.sender;
	}	

	function splitAmount(address rec1, address rec2) public payable returns(bool res) {
	/* Validate receiver address */
    	require (rec1 != address(0), "Receiver 1 Address is required");
    	require (rec2 != address(0), "Receiver 2 Address is required");
    	require (rec1 != rec2, "different adresses are required");

    	require (msg.value > 0, "Invalid amount");
		
		//Check remainder and send back the amount in eccess
		uint split = msg.value / 2;
		uint remainder = msg.value % 2;
		
		amounts[rec1] += split; 
		amounts[rec2] += split;
		amounts[msg.sender] += remainder;

		return true;
	}

	function withdraw(uint amount) public returns(bool res) {
		
		require (amounts[msg.sender] - amount >= 0);
		require (amount > 0);
		amounts[msg.sender] -= amount;
		msg.sender.transfer(amount);
		return true;

	}
	function getBalance(address addr) public view returns(uint) {
		return amounts[addr];
	}

}
