import React from 'react';
import pendingBg from "../assets/pending.jpg";
import avtar_1 from "../assets/avtar_6.png";
import Tilt from "react-parallax-tilt";
import pending_sign from "../assets/pending_sign.jpg";
import "./styles/pending.css";
import pending_write from "../assets/pending_write.png";
import { useState, useEffect } from 'react';
import LinkedInContract from '../ethereum/LinkedInContract';
import { ethers } from "ethers";

export const Pending = () => {
    const [walletAddress, setWalletAddress] = useState("");
    const [userID, setUserID] = useState("");

    const [pendingUsers, setPendingUsers] = useState([]);
    const [updatedPendingUsers, setUpdatedPendingUsers] = useState([]);

    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();
        const getPendingUsers = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract_instance = LinkedInContract(provider);
                const _pendingUsers = await contract_instance.getPendingRequests(userID);
                setPendingUsers(_pendingUsers);
                let promises = [];
                for (const user of pendingUsers) {
                    if (user.connected === false) {
                        const _user = await contract_instance.userDashBoard(user.sender);
                        promises.push(_user);
                    }
                }
                const finalResult_info = await Promise.all(promises);
                // console.log(pendingUsers);
                let promises_dp = [];
                let temp = [];
                for (const user of finalResult_info) {
                    const _userID = user.userID;
                    const _dp = await contract_instance.getProfilePicture(_userID);
                    promises_dp.push(_dp);
                }
                const finalResult_dp = await Promise.all(promises_dp);

                finalResult_info.map((user, index) => {
                    temp.push({
                        UserName: user.userName,
                        Profession: user.profession,
                        Country: user.country,
                        Dp: `https://tomato-near-puma-781.mypinata.cloud/ipfs/${finalResult_dp[index]}`,
                        UserID: user.userID
                    })
                });
                setUpdatedPendingUsers(temp);
                // console.log(updatedPendingUsers);

            } catch (error) {
                console.log(error);
            }
        }
        getPendingUsers();
    }, [updatedPendingUsers, walletAddress]);

    const acceptRequest = async (event, _userID) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract_instance_accept = LinkedInContract(signer);
        await contract_instance_accept.acceptRequest(_userID);
        alert("Request accepted !");
    }

    const renderCards = updatedPendingUsers.map((UserCard, index) => (
        < Tilt key={index} >
            <div className="cardd">
                <img src={UserCard.Dp} />
                <h2> {UserCard.UserName}  </h2>
                <p> {UserCard.Profession} </p>
                <p>{UserCard.Country} </p>
                <button onClick={(event) => acceptRequest(event, UserCard.UserID)} style={{ background: "transparent", border: "0.1px solid #ffff", borderRadius: "50px" }}> Accept </button>
            </div>
        </Tilt>
    ));

    const getCurrentWalletConnected = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);

                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setUserID(accounts[0]);
                    // console.log(accounts[0]);
                } else {
                    console.log("Connect to MetaMask using the Connect button");
                }
            } catch (err) {
                console.error(err.message);
            }
        } else {
            /* MetaMask is not installed */
            console.log("Please install MetaMask");
        }
    };
    const addWalletListener = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            window.ethereum.on("accountsChanged", (accounts) => {
                setWalletAddress(accounts[0]);
                setUserID(accounts[0]);
                // console.log(accounts[0]);
            });
        } else {
            /* MetaMask is not installed */
            setWalletAddress("");
            console.log("Please install MetaMask");
        }
    };

    return (
        <div style={{ height: "100vh", width: "100vw", backgroundImage: `url(${pendingBg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0px", backdropFilter: "blur(1px)" }}>
                <img src={pending_write} style={{ height: "70px", borderRadius: "20px" }} />
                <img src={pending_sign} style={{ height: "70px", borderRadius: "20px" }} />
            </div>
            <div className='containerr'>
                {renderCards}
            </div>
        </div>
    )
}
