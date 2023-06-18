import abi from "./abi.json";
import { ethers } from "ethers";

const LinkedInContract = (provider) => {

    return new ethers.Contract(
        "0xaCF924C5f4F428303FB958F176Fd9a0d6f56eB1e",
        abi,
        provider
    );
}

export default LinkedInContract;