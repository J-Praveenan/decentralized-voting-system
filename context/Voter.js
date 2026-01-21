import React, { useState, useEffect, use } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { useRouter } from "next/router";

// Internal Imports
import { VotingAddress, VotingAddressABI } from "./constants";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext();

export const VotingProvider = ({ children }) => {
  const votingTitle = "My First Smart Contract App";
  const router = useRouter();

  const [currentAccount, setCurrentAccount] = useState("");
  const [candidateLength, setCandidateLength] = useState("");
  const pushCandidate = [];
  const candidateIndex = [];
  const [candidateArray, setCandidateArray] = useState(pushCandidate);

  //-----END OF THE CANDIDATE DATA

  const [error, setError] = useState("");
  const highestVote = [];

  //----- VOTER SECTION
  const pushVoter = [];
  const [voterArray, setVoterArray] = useState(pushVoter);
  const [voterLength, setVoterLength] = useState("");
  const [voterAddress, setVoterAddress] = useState([]);

  //---CONNECTING METAMASK
  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Please Install Metamask");

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      setError("Please Install Metamask & Connect, Reload");
    }
  };

  //----CONNECT WALLET
  const connectWallet = async () => {
    if (!window.ethereum) return setError("Please Install Metamask");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setCurrentAccount(accounts[0]);
  };

  //-- UPLOAD TO IPFS VOTER IMAGE
  // const uploadToIPFS = async (file) => {
  //   try {
  //     const added = await client.add({content: file});
  //     const url = `https://ipfs.infura.io/ipfs/${added.path}`;
  //     return url;
  //   } catch (error) {
  //     setError("Error Uploading file to IPFS");
  //   }
  // };

  //-- UPLOAD TO IPFS VOTER IMAGE
  const uploadToIPFS = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET,
          },
        },
      );

      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      return url;
    } catch (error) {
      console.error(error);
      setError("Error uploading file to Pinata");
    }
  };

  //-- UPLOAD TO IPFS CANDIDATE IMAGE
  const uploadToIPFSCandidate = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET,
          },
        },
      );

      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      return url;
    } catch (error) {
      console.error(error);
      setError("Error uploading file to Pinata");
    }
  };

  //--------- CREATE VOTER
  const createVoter = async (formInput, fileUrl, router) => {
    try {
      const { name, address, position } = formInput;
      // console.log(name, address, position, fileUrl);
      if (!name || !address || !position) return setError("Data is missing");

      // CONNECTING SMART CONTRACT
      const web3Modal = new Web3Modal();
      // console.log(web3Modal);

      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      // console.log(contract);

      // const data = JSON.stringify({name, address, position, image: fileUrl});
      // const added = await client.add(data);
      // const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      const metadata = {
        name,
        address,
        position,
        image: fileUrl,
      };

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET,
          },
        },
      );

      const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      // console.log("Metadata URL:", url);

      const voter = await contract.voterRight(address, name, url, fileUrl);
      await voter.wait();

      console.log("Voter created successfully:", voter);

      router.push("/voterList");
    } catch (error) {
      setError("Error in creating voter");
    }
  };

  //------ GET VOTER DATA
  const getAllVoterData = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      //---VOTER LIST
      const voterListData = await contract.getVoterList();
      setVoterAddress(voterListData);
      // console.log(voterAddress);

      voterListData.map(async (el) => {
        const singleVoterData = await contract.getVoterdata(el);
        pushVoter.push(singleVoterData);

        // console.log(singleVoterData);
      });

      //---VOTER LENGTH
      const voterList = await contract.getVoterLength();
      setVoterLength(voterList.toNumber());
    } catch (error) {
      setError("Error while fetching Voter Data");
    }
  };

  // console.log(voterAddress);
  // useEffect(() => {
  //   getAllVoterData();
  // }, []);

  // ---- GIVE VOTE
  const giveVote = async (id) => {
    try {
      const voterAddress = id.address;
      const voterId = id.id;

      // CONNECTING SMART CONTRACT
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      // const votedList = await contract.vote(voterAddress, voterId);
      const votedList = await contract.vote(voterAddress, voterId);
      await votedList.wait(); // ✅ REQUIRED
      console.log(votedList);
    } catch (error) {
      console.error(error);

      // Extract revert reason safely
      const message =
        error?.data?.message ||
        error?.error?.message ||
        error?.reason ||
        "Transaction failed";

      setError(
        message.replace(
          "VM Exception while processing transaction: revert ",
          "",
        ),
      );
    }
  };

  // ------------- CANDIDATE SECTION --------------------
  const setCandidate = async (candidateForm, fileUrl, router) => {
    try {
      const { name, address, age } = candidateForm;
      // console.log(name, address, position, fileUrl);
      if (!name || !address || !age) return setError("Input Data is missing");

      console.log(name, address, age, fileUrl);

      // CONNECTING SMART CONTRACT
      const web3Modal = new Web3Modal();
      // console.log(web3Modal);

      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      // console.log(contract);

      // const data = JSON.stringify({name, address, position, image: fileUrl});
      // const added = await client.add(data);
      // const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      const metadata = {
        name,
        address,
        image: fileUrl,
        age,
      };

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY,
            pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET,
          },
        },
      );

      const ipfs = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      // console.log("Metadata URL:", url);

      const candidate = await contract.setCandidate(
        address,
        age,
        name,
        fileUrl,
        ipfs,
      );
      await candidate.wait();

      console.log(candidate);

      router.push("/");
    } catch (error) {
      setError("Error in creating voter");
    }
  };

  //-- GET CANDIDATE DATA
  const getNewCandidate = async () => {
    try {
      //CONNECTING SMART CONTRACT
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      //---ALL CANDIDATE
      const allCandidate = await contract.getCandidate();
      // console.log(allCandidate);

      allCandidate.map(async (el) => {
        const singleCandidateData = await contract.getCandidatedata(el);
        pushCandidate.push(singleCandidateData);
        candidateIndex.push(singleCandidateData[2].toNumber());
        // console.log(singleCandidateData);
      });

      //--- CANDIDATE LENGTH
      const allCandidateLength = await contract.getCandidateLength();
      setCandidateLength(allCandidateLength.toNumber());
    } catch (error) {
      console.log(error);
    }
  };

  const getWinner = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const contract = fetchContract(provider);

      const addresses = await contract.getCandidate();

      let winner = null;
      let maxVotes = -1;

      for (let i = 0; i < addresses.length; i++) {
        const data = await contract.getCandidatedata(addresses[i]);

        const voteCount = data[4].toNumber();

        if (voteCount > maxVotes) {
          maxVotes = voteCount;
          winner = {
            age: data[0],
            name: data[1],
            id: data[2].toNumber(),
            image: data[3],
            votes: voteCount,
            ipfs: data[5],
            address: data[6],
          };
        }
      }

      return winner;
    } catch (error) {
      console.error("Error fetching winner:", error);
    }
  };

  // useEffect(() => {
  //   getNewCandidate();
  // }, []);

  return (
    <VotingContext.Provider
      value={{
        votingTitle,
        checkIfWalletIsConnected,
        connectWallet,
        uploadToIPFS,
        getAllVoterData,
        createVoter,
        giveVote,
        setCandidate,
        getNewCandidate,
        error,
        setError,
        voterArray,
        voterLength,
        voterAddress,
        currentAccount,
        candidateLength,
        candidateArray,
        uploadToIPFSCandidate,
        getWinner,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
