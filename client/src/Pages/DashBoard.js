import React from 'react';
import Profile from "../assets/Profile.jpg";
import avtar_1 from "../assets/avtar_6.png";
import Tilt from "react-parallax-tilt";
import "./styles/dashboard.css";
import dashboardLogo from "../assets/DashBoardLogo.jpg";
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import LinkedInContract from '../ethereum/LinkedInContract';

export const DashBoard = () => {

    const [walletAddress, setWalletAddress] = useState("");
    const [userID, setUserID] = useState("");
    const [lInContract, setlInContract] = useState(null);
    const [userInfo, setUserInfo] = useState({
        userName: "",
        profession: "",
        country: "",
        userID: userID,
        userCID: "",
        userNum: "",
    });
    const [profilePic, setProfilePic] = useState("https://www.google.co.in/search?q=default+nft&tbm=isch&ved=2ahUKEwiMwM7n38n_AhV1CbcAHYZWB-oQ2-cCegQIABAA&oq=default+nft&gs_lcp=CgNpbWcQAzIHCAAQGBCABDIHCAAQGBCABDIHCAAQGBCABDIHCAAQGBCABDIHCAAQGBCABDIHCAAQGBCABDIHCAAQGBCABDoLCAAQgAQQsQMQgwE6CAgAEIAEELEDOgUIABCABFDJB1iXDmDmDmgAcAB4AIABywKIAbEFkgEHMC4xLjEuMZgBAKABAaoBC2d3cy13aXotaW1nwAEB&sclient=img&ei=QVyNZMybE_WS3LUPhq2d0A4&authuser=0&bih=685&biw=1396&hl=en#imgrc=WNbgCpRvvoWTNM");
    const [totalConnections, setTotalConnection] = useState("");

    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();
        const getDashboardInfo = async () => {
            try {
                const temp = await lInContract.userDashBoard(userID);
                const _pic = await lInContract.getProfilePicture(userID);
                const _totalConnections = await lInContract.getConnectedUsers(userID);
                setTotalConnection(_totalConnections.length);

                setUserInfo(temp);
                setProfilePic(_pic);
                // console.log(userInfo);
                // console.log(profilePic);
            } catch (error) {
                console.log(error);
            }
        }
        getDashboardInfo();

    }, [walletAddress, userInfo, totalConnections]);


    const getCurrentWalletConnected = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);

                setlInContract(LinkedInContract(provider));

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
        <div style={{ height: "100%", width: "100%", backgroundImage: `url(${Profile})`, backgroundSize: "cover", backgroundPosition: "center" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "flex-start", gap: "300px", marginTop: "0px", marginRight: "0px" }}>
                <img src={dashboardLogo} style={{ height: "70px", borderRadius: "20px" }} />
                < Tilt>
                    <div className='profileStats' >
                        <p> Your Address: {userID} </p>
                        <p> Total Connections: {totalConnections}  </p>
                    </div>
                </Tilt>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                < Tilt>
                    <div className='profileCard'>
                        <img src={`https://tomato-near-puma-781.mypinata.cloud/ipfs/${profilePic}`} />
                        <h2> {userInfo.userName}  </h2>
                        <p> {userInfo.profession} </p>
                        <p> {userInfo.country} </p>
                    </div>
                </Tilt>
            </div>
        </div>
    )
}
