import React from 'react';
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import LinkedInContract from "../ethereum/LinkedInContract.js";
import Dashboard from "../assets/Dashboard.jpg";
import welcome from "../assets/welcome.jpg";
import dp from "../assets/dp.avif";
import "./styles/register.css";
import FormData from 'form-data';
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Register = () => {
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState("");
    const [signer, setSigner] = useState("");
    const [lInContract, setlInContract] = useState(null);
    const [userName, setUserName] = useState("");
    const [userID, setUserID] = useState("");
    const [profession, setProfession] = useState("");
    const [country, setCountry] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);

    useEffect(() => {
        getCurrentWalletConnected();
        addWalletListener();
    }, [walletAddress]);

    const connectWallet = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {
                /* MetaMask is installed */
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);

                setSigner(provider.getSigner());

                setlInContract(LinkedInContract(provider));

                setWalletAddress(accounts[0]);
                setUserID(accounts[0]);
                console.log(accounts[0]);
            } catch (err) {
                console.error(err.message);
            }
        } else {
            /* MetaMask is not installed */
            console.log("Please install MetaMask");
        }
    };

    const getCurrentWalletConnected = async () => {
        if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
            try {

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send("eth_accounts", []);

                setSigner(provider.getSigner());
                setlInContract(LinkedInContract(provider));

                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setUserID(accounts[0]);
                    console.log(accounts[0]);
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
                console.log(accounts[0]);
            });
        } else {
            /* MetaMask is not installed */
            setWalletAddress("");
            console.log("Please install MetaMask");
        }
    };

    const handleChange_UserName = async (event) => {
        setUserName(event.target.value);
        // console.log(userName);
    }
    const handleChange_Profession = async (event) => {
        setProfession(event.target.value);
        // console.log(profession);
    }
    const handleChange_Country = async (event) => {
        setCountry(event.target.value);
        // console.log(country);
    }
    const handleChange_dp = async (event) => {
        const dp_file = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(dp_file);
        reader.onloadend = () => {
            setProfilePicture(event.target.files[0]);
        }
        // console.log(profilePicture);
    }
    // Submit Profile Avtar Form
    const submit_dp = async (event) => {
        const formData = new FormData();
        formData.append("file", profilePicture);
        event.preventDefault();
        if (profilePicture) {
            try {
                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        pinata_api_key: `Your key`,
                        pinata_secret_api_key: `Your key`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
                console.log(`Image Hash: ${ImgHash}`);
                // console.log(resFile.data.IpfsHash);

                const contract_instance = LinkedInContract(signer);
                await contract_instance.uploadProfilePicture(resFile.data.IpfsHash);
                alert("Profile Avtar Uploaded Successfully!");
                setProfilePicture(null);
                navigate("/dashboard")
            } catch (error) {
                console.log(error);
                alert("Error in uploading Profile Avatar");
            }
        }
    }

    // Submit User Data Form
    const submit_userData = async (event) => {
        event.preventDefault();

        const formData = JSON.stringify({
            "pinataMetadata": {
                name: "User Credentials"
            },
            "pinataContent": {
                "UserName": userName,
                "UserID": userID,
                "Profession": profession,
                "Country": country
            }
        });

        try {
            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data: formData,
                headers: {
                    pinata_api_key: `Your key`,
                    pinata_secret_api_key: `Your key`,
                    "Content-Type": "application/json",
                },
            });
            const DataHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
            console.log(`Data Hash: ${DataHash}`);
            // console.log(resFile.data.IpfsHash);
            alert("Registration is Successfull!");

            const contract_instance = LinkedInContract(signer);
            await contract_instance.createUser(resFile.data.IpfsHash, userName, profession, country);


        } catch (error) {
            console.log(error);
            alert("Error in Register");
        }


    }

    return (
        <div style={{ backgroundImage: `url(${Dashboard})`, backgroundSize: "cover", backgroundPosition: "center", opacity: "1", width: "100%", height: "100%" }}>
            <div style={{ display: "flex", gap: "870px", justifyContent: "center" }}>
                <img src={welcome} style={{ width: "360px", height: "360px", borderRadius: "180px", marginTop: "26px" }} />
                <button className="btn btn-primary" onClick={connectWallet} style={{ background: "transparent", marginRight: "10px", marginTop: "100px", width: "250px", height: "50px", fontSize: "30px", textAlign: "center", padding: "0", marginRight: "5px", marginTop: "5px" }}> Connect Wallet </button>
            </div>

            <div className="form-box">
                <div className="form-value">
                    <form action="">
                        <h2>Lets Link</h2>
                        <div className="inputbox">
                            <ion-icon name="mail-outline"></ion-icon>
                            <input type="username" onChange={handleChange_UserName} required />
                            <label htmlFor="">UserName</label>
                        </div>
                        <div className="inputbox">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                            <input required value={userID} />
                            <label htmlFor=""> UserID</label>
                        </div>
                        <div className="inputbox">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                            <input required onChange={handleChange_Profession} />
                            <label htmlFor=""> Profession</label>
                        </div>
                        <div className="inputbox">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                            <input required onChange={handleChange_Country} />
                            <label htmlFor=""> Country </label>
                        </div>
                        <button onClick={submit_userData} type={'submit'} style={{ background: "transparent", border: "0.1px solid #ffff", borderRadius: "50px" }} > Register </button>
                    </form>
                </div>
            </div>
            <div className="form-box">
                <div className="form-value">
                    <form action="">
                        <div className="inputbox">
                            <ion-icon name="mail-outline"></ion-icon>
                            <img src={dp} style={{ width: "180px", height: "180px", borderRadius: "90px" }} />
                        </div>

                        <div className="inputbox">
                            <ion-icon name="lock-closed-outline"></ion-icon>
                            <input required style={{ borderRadius: "50px", background: "transparent", color: "lightblue" }} type="file" onChange={handleChange_dp} />
                        </div>
                        <button onClick={submit_dp} type={'submit'} style={{ background: "transparent", border: "0.1px solid #ffff", borderRadius: "50px" }} > Upload Profile Avtar </button>
                    </form>
                </div>
            </div>
            <div style={{ opacity: "0" }}>
                <h1>welcome </h1>
            </div>
            <div style={{ opacity: "0" }}>
                <h1>welcome </h1>
            </div>
            <div style={{ opacity: "0" }}>
                <h1>welcome </h1>
            </div>
        </div>
    )
}
