import React from 'react';
import { useEffect, useState } from 'react';
import HomePage from "../assets/x.jpg";
import letsConnect from "../assets/connect.png";
import three from "../assets/three.png";
import avtar_1 from "../assets/avtar_6.png";
import "./styles/home.css";
import Tilt from "react-parallax-tilt";
import LinkedInContract from '../ethereum/LinkedInContract';
import { ethers, providers } from 'ethers';
import axios from 'axios';

export const Home = () => {
    const [walletAddress, setWalletAddress] = useState("");
    const [userID, setUserID] = useState("");
    const [lInContract, setlInContract] = useState(null);

    let Updated_Cards = [];
    const [finalCards, setFinalCards] = useState([]);
    const [finalCardsWith_DP, setFinalCardsWith_DP] = useState([]);
    let x = [];

    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();
        const fetchUsers = async () => {
            try {

                // To get the User information 
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                let contract_instance = LinkedInContract(provider);
                const resp = await contract_instance.getAllUsers();
                x = resp;
                const promises = [];
                for (const userCID of x) {
                    const resp = await axios({
                        method: "get",
                        maxBodyLength: Infinity,
                        url: `https://tomato-near-puma-781.mypinata.cloud/ipfs/${userCID}`,
                        headers: {
                            Accept: "application/json",
                        }
                    });
                    promises.push(resp);
                }
                const finalResult = await Promise.all(promises);
                finalResult.map((userCard) => {
                    Updated_Cards.push(userCard.data);
                });
                // console.log(Updated_Cards);
                setFinalCards(Updated_Cards);
                Updated_Cards = [];
                // console.log(finalCards);
                // ----------------------------------------------------------------------------------------------------------------------
                // ----------------------------------------------------------------------------------------------------------------------

                // To get the user Profile Picture
                let temp = [];
                let profile_pic_Array = [];
                profile_pic_Array = await contract_instance.get_Dp_Of_All_Users();
                // console.log(profile_pic_Array);
                finalCards.map((finalCard, index) => {
                    temp.push({
                        UserName: finalCard.UserName,
                        Profession: finalCard.Profession,
                        Country: finalCard.Country,
                        UserID: finalCard.UserID,
                        Dp: `https://tomato-near-puma-781.mypinata.cloud/ipfs/${profile_pic_Array[index]}`
                    })
                });
                setFinalCardsWith_DP(temp);
                // console.log(finalCardsWith_DP);


                // * **********************************************************************************************************
                // * let promises_Dp_Array = [];                                                                              *
                // * for (const finalCard of finalCards) {                                                                    *
                // *     const user_address = finalCard.UserID;                                                               *
                // *     const pic_CID = await contract_instance.getProfilePicture(user_address);                             *
                // *     promises_Dp_Array.push(pic_CID);                                                                     *
                // * }                                                                                                        *
                // * const resolve_promises_Dp_Array = await Promise.all(promises_Dp_Array);                                  *
                // * finalCards.map((finalCard, index) => {                                                                   * Can Get profile picture of 
                // *     temp.push({                                                                                          * each user this way also
                // *         UserName: finalCard.UserName,                                                                    *
                // *         Profession: finalCard.Profession,                                                                *
                // *         Country: finalCard.Country,                                                                      *
                // *         Dp: `https://tomato-near-puma-781.mypinata.cloud/ipfs/${resolve_promises_Dp_Array[index]}`       *
                // *     })                                                                                                   *
                // * });                                                                                                      *
                // * **********************************************************************************************************

            } catch (error) {
                console.log(error);
            }
        }
        fetchUsers();
    }, [finalCardsWith_DP, walletAddress]);

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

    const sendRequest = async (event, _userID) => {
        // console.log(event);
        // console.log(_userID);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract_req = LinkedInContract(signer);
            await contract_req.sendRequest(_userID);
            alert("request Sent! ");

        } catch (error) {
            console.log(error);
        }
    }


    const renderCards = finalCardsWith_DP.map((UserCard, index) => (
        < Tilt key={index} >
            <div className="cardd">
                <img src={UserCard.Dp} />
                <h2> {UserCard.UserName}  </h2>
                <p> {UserCard.Profession} </p>
                <p>{UserCard.Country} </p>
                <button disabled={userID === UserCard.UserID} onClick={(event) => sendRequest(event, UserCard.UserID)} style={{ background: "transparent", border: "0.1px solid #ffff", borderRadius: "50px" }}> Connect </button>
            </div>
        </Tilt>
    ));

    return (
        <div style={{ position: "relative", height: "100vh", width: "100vw", backgroundImage: `url(${HomePage})`, backgroundSize: "cover", backgroundPosition: "center" }}>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0px", backdropFilter: "blur(1px)" }}>
                <img src={letsConnect} style={{ height: "70px", borderRadius: "20px" }} />
                <img src={three} style={{ height: "70px", borderRadius: "20px" }} />
            </div>
            <div className='containerr'>
                {renderCards}
            </div>
        </div >
    )
}
