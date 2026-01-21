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
  const [votingCandidateId, setVotingCandidateId] = useState(null);
  const [creatingCandidate, setCreatingCandidate] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [creatingVoter, setCreatingVoter] = useState(false);

  const [currentAccount, setCurrentAccount] = useState("");
  const [candidateLength, setCandidateLength] = useState("");

  const [candidateArray, setCandidateArray] = useState([]);

  //-----END OF THE CANDIDATE DATA

  const [error, setError] = useState("");
  const highestVote = [];

  //----- VOTER SECTION
  const [voterArray, setVoterArray] = useState([]);
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
      setCreatingVoter(true);
      setError("");
      setSuccessMessage("");

      const { name, address, position } = formInput;

      if (!name || !address || !position || !fileUrl) {
        throw new Error("All fields are required");
      }

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const metadata = {
        name,
        address,
        nic: position,
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

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;

      const tx = await contract.voterRight(address, name, ipfsUrl, fileUrl);
      await tx.wait();

      // ✅ SUCCESS
      setSuccessMessage("Voter authorized successfully");

      // 🔄 REFRESH DATA
      await getAllVoterData();
      router.push("/voterList");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.reason ||
        error?.message ||
        "Voter authorization failed";

      setError(
        message.replace(
          "VM Exception while processing transaction: revert ",
          "",
        ),
      );
    } finally {
      setCreatingVoter(false);
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

      const voterListData = await contract.getVoterList();
      setVoterAddress(voterListData);

      const voters = await Promise.all(
        voterListData.map(async (address) => {
          return await contract.getVoterdata(address);
        }),
      );

      // ✅ SET STATE ONCE
      setVoterArray(voters);

      const voterListLength = await contract.getVoterLength();
      setVoterLength(voterListLength.toNumber());
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
      setVotingCandidateId(id.id);
      setError("");
      setSuccessMessage("");
      const voterAddress = id.address;
      const voterId = id.id;

      // CONNECTING SMART CONTRACT
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const tx = await contract.vote(voterAddress, voterId);

      await tx.wait(); // ⏳ wait for blockchain confirmation

      // ✅ SUCCESS
      setSuccessMessage("Your vote has been successfully recorded.");

      // 🔄 REFRESH DATA (NO PAGE RELOAD)
      await getNewCandidate();
      await getAllVoterData();
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
    } finally {
      // ✅ ALWAYS stop processing (success OR error)
      setVotingCandidateId(null);
    }
  };

  // ------------- CANDIDATE SECTION --------------------
  const setCandidate = async (candidateForm, fileUrl, router) => {
    try {
      setCreatingCandidate(true);
      setError("");
      setSuccessMessage("");

      const { name, address, party } = candidateForm;
      if (!name || !address || !party || !fileUrl) {
        throw new Error("All fields are required");
      }

      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const metadata = { name, address, image: fileUrl, party };

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

      const tx = await contract.setCandidate(
        address,
        party,
        name,
        fileUrl,
        ipfs,
      );

      await tx.wait();
      setSuccessMessage("Candidate authorized successfully");

      await getNewCandidate();

      router.push("/");
    } catch (error) {
      const message =
        error?.data?.message ||
        error?.reason ||
        error?.message ||
        "Candidate authorization failed";

      setError(
        message.replace(
          "VM Exception while processing transaction: revert ",
          "",
        ),
      );
    } finally {
      setCreatingCandidate(false);
    }
  };

  //-- GET CANDIDATE DATA
  const getNewCandidate = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const allCandidate = await contract.getCandidate();

      const candidates = await Promise.all(
        allCandidate.map(async (el) => {
          return await contract.getCandidatedata(el);
        }),
      );

      // ✅ SET STATE ONCE (no duplicates)
      setCandidateArray(candidates);

      const allCandidateLength = await contract.getCandidateLength();
      setCandidateLength(allCandidateLength.toNumber());
    } catch (error) {
      console.error(error);
    }
  };

  const getWinner = async () => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const contract = fetchContract(provider);

      const addresses = await contract.getCandidate();

      const candidates = await Promise.all(
        addresses.map(async (addr) => {
          return await contract.getCandidatedata(addr);
        }),
      );

      const voteCounts = candidates.map((c) => c[4].toNumber());
      const maxVotes = Math.max(...voteCounts);

      // ❌ No votes at all
      if (maxVotes === 0) {
        return { status: "NO_VOTES" };
      }

      const topCandidates = candidates.filter(
        (c) => c[4].toNumber() === maxVotes,
      );

      // 🤝 Tie
      if (topCandidates.length > 1) {
        return { status: "TIE", votes: maxVotes };
      }

      // 🏆 Winner
      const c = topCandidates[0];
      return {
        status: "WINNER",
        data: {
          party: c[0],
          name: c[1],
          id: c[2].toNumber(),
          image: c[3],
          votes: maxVotes,
          ipfs: c[5],
          address: c[6],
        },
      };
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
        creatingCandidate,
        creatingVoter,
        setError,
        voterArray,
        voterLength,
        voterAddress,
        currentAccount,
        candidateLength,
        votingCandidateId,
        successMessage,
        setSuccessMessage,
        candidateArray,
        uploadToIPFSCandidate,
        getWinner,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
};
