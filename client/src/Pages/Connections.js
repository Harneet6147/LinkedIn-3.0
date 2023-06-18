import React from 'react';
import connections from "../assets/Connections.jpg";
import connectionsLogo from "../assets/connectionsLogo.png";
import connectSign from "../assets/connect_sign.jpg";
import Tilt from "react-parallax-tilt";
import avatr_6 from "../assets/avtar_6.png";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import LinkedInContract from '../ethereum/LinkedInContract';
import "./styles/connections.css";

export const Connections = () => {

    const [walletAddress, setWalletAddress] = useState("");
    const [userID, setUserID] = useState("");
    const [yourConnections, setYourConnections] = useState([]);
    const [updatedYourConnections, setUpdatedYourConnections] = useState([]);

    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();
        const getPendingUsers = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract_instance = LinkedInContract(provider);
                const _connections = await contract_instance.getConnectedUsers(userID);
                setYourConnections(_connections);
                // console.log(yourConnections);

                let promises_dp = [];
                let temp = [];
                for (const user of yourConnections) {
                    const _userID = user.userID;
                    const _dp = await contract_instance.getProfilePicture(_userID);
                    promises_dp.push(_dp);
                }
                const finalResult_dp = await Promise.all(promises_dp);

                yourConnections.map((user, index) => {
                    temp.push({
                        UserName: user.userName,
                        Profession: user.profession,
                        Country: user.country,
                        Dp: `https://tomato-near-puma-781.mypinata.cloud/ipfs/${finalResult_dp[index]}`,
                        UserID: user.userID
                    })
                });
                setUpdatedYourConnections(temp);
                // console.log(updatedYourConnections);

            } catch (error) {
                console.log(error);
            }
        }
        getPendingUsers();
    }, [updatedYourConnections, walletAddress]);

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

    const renderCards = updatedYourConnections.map((UserCard, index) => (
        < Tilt key={index} >
            <div className="cardd">
                <img src={UserCard.Dp} />
                <h2> {UserCard.UserName}  </h2>
                <p> {UserCard.Profession} </p>
                <p>{UserCard.Country} </p>
            </div>
        </Tilt>
    ));
    
    return (
        <div style={{ height: "100vh", width: "100vw", backgroundImage: `url(${connections})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0px", backdropFilter: "blur(1px)" }}>
                <img src={connectionsLogo} style={{ height: "70px", borderRadius: "20px", width: "200px" }} />
                <img src={connectSign} style={{ height: "70px", borderRadius: "20px", width: "80px" }} />
            </div>
            <div className='containerr'>
                {renderCards}
            </div>
        </div>
    )
}
