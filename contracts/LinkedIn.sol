// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract LinkedIn {
    using Counters for Counters.Counter;
    Counters.Counter public entryNumber;

    address payable owner;

    constructor() {
        owner = payable(msg.sender);
    }

    struct userData {
        string userCID;
        string userName;
        address userID; // This is the user's browser wallet address
        string profession;
        uint256 userNum; // This helps us to know the entry number of the user
        string country;
    }
    string[] public userArray;
    string[] public userDpArray;
    mapping(address => userData) public allUsers; // To have a data of all the users. (This will help us in userDashboard Page)

    struct userConnections {
        address sender;
        address receiver;
        bool connected;
    }
    mapping(address => userConnections[]) public connections;
    mapping(address => userData[]) public approved_connected_users; // To store the connected users where bool connected = true;
    mapping(address => userConnections[]) public pending_requests;
    event RequestSent(address sender, address receiver);
    event RequestAccepted(address sender, address receiver);

    function sendRequest(address _receiver) external {
        require(msg.sender != _receiver, "You cannot send request to yourself");
        bool check = false;
        for (uint256 i = 0; i < connections[msg.sender].length; i++) {
            if (connections[msg.sender][i].receiver == _receiver) {
                check = true;
                break;
            }
        }
        require(check == false, "Request already sent!");

        connections[msg.sender].push(
            userConnections({
                sender: msg.sender,
                receiver: _receiver,
                connected: false
            })
        );
        pending_requests[_receiver].push(
            userConnections({
                sender: msg.sender,
                receiver: _receiver,
                connected: false
            })
        );
        emit RequestSent(msg.sender, _receiver);
    }

    function acceptRequest(address _sender) external {
        bool found = false;
        bool check = false;
        uint256 index = 0;
        for (uint256 i = 0; i < connections[_sender].length; i++) {
            if (connections[_sender][i].receiver == msg.sender) {
                index = i;
                found = true;
                if (connections[_sender][i].connected == true) {
                    check = true;
                }
                break;
            }
        }

        require(found == true, "Connection request not found !");
        require(check == false, "Already Connected to this user !");

        connections[msg.sender].push(
            userConnections({
                sender: _sender,
                receiver: msg.sender,
                connected: true
            })
        );

        connections[_sender][index].connected = true;
        
        for (uint256 i = 0; i < pending_requests[msg.sender].length; i++) {
            if (pending_requests[msg.sender][i].sender == _sender) {
                pending_requests[msg.sender][i].connected = true;
                break;
            }
        }

        approved_connected_users[msg.sender].push(allUsers[_sender]);
        approved_connected_users[_sender].push(allUsers[msg.sender]);
        emit RequestAccepted(_sender, msg.sender);
    }

    function getAllUsers() external view returns (string[] memory) {
        return userArray;
    }

    function userDashBoard(
        address _userID
    ) external view returns (userData memory) {
        return allUsers[_userID];
    }

    function getConnectedUsers(
        address _userID
    ) external view returns (userData[] memory) {
        return approved_connected_users[_userID];
    }

    struct profilePicture {
        string pictureCID;
    }
    mapping(address => profilePicture) public userProfilePicture;

    function uploadProfilePicture(string memory _newPicCid) external {
        userProfilePicture[msg.sender] = profilePicture({
            pictureCID: _newPicCid
        });
        userDpArray.push(_newPicCid);
    }

    function createUser(
        string memory _userCID,
        string memory _userName,
        string memory _profession,
        string memory _country
    ) external {
        entryNumber.increment();
        userData memory newUser = userData({
            userCID: _userCID,
            userName: _userName,
            userID: msg.sender,
            profession: _profession,
            userNum: entryNumber.current(),
            country: _country
        });

        userArray.push(_userCID);
        allUsers[msg.sender] = newUser;
    }

    function getProfilePicture(
        address _userID
    ) external view returns (string memory) {
        return userProfilePicture[_userID].pictureCID;
    }

    function get_Dp_Of_All_Users() external view returns (string[] memory) {
        return userDpArray;
    }

    function getPendingRequests(
        address _userID
    ) external view returns (userConnections[] memory) {
        return pending_requests[_userID];
    }
}
