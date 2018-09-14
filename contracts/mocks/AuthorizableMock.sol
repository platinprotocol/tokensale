pragma solidity ^0.4.24; // solium-disable-line linebreak-style

import "../Authorizable.sol";


contract AuthorizableMock is Authorizable {

    function doSmth() public view onlyAuthorized {}

}
