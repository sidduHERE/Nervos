pragma solidity >=0.8.0;

contract SimpleStorage {
  uint votes;

  constructor() payable {
    votes = 123;
  }

  function vote(uint x) public payable {
    votes = x;
  }

  function totalnumberofVotes() public view returns (uint) {
    return votes;
  }
}