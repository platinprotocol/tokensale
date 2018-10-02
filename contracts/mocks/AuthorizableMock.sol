pragma solidity ^0.4.25; // solium-disable-line linebreak-style

/**
 * @author Anatolii Kucheruk (anatolii@platin.io)
 * @author Platin Limited, platin.io (platin@platin.io)
 */

import "../Authorizable.sol";


contract AuthorizableMock is Authorizable {

    function doSmth() public view onlyAuthorized {}

}
