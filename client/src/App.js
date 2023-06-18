import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './Pages/Home';
import { Register } from './Pages/ConnectWallet';
import { Connections } from './Pages/Connections';
import { Pending } from './Pages/Pending';
import { DashBoard } from './Pages/DashBoard';
import { Navbar } from './components/Navbar';
import { useState } from 'react';
import { ethers } from 'ethers';
import LinkedInContract from './ethereum/LinkedInContract';

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState("");
  const [lInContract, setlInContract] = useState(null);
  const [userID, setUserID] = useState("");

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
  
  return (
    <div className="App">
      <Router>
        <Navbar />
        <Routes>
          <Route path='/home' element={<Home />} />
          <Route path='/connectWallet' element={<Register />} />
          <Route path='/connections' element={<Connections />} />
          <Route path='/pending' element={<Pending />} />
          <Route path='/dashboard' element={<DashBoard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
