# 🗳️ Ethereum Decentralized Voting DApp

A **Blockchain-based Voting DApp** built using **Next.js, Solidity, MetaMask, Hardhat, and IPFS (Pinata)**.  
This project demonstrates a complete Web3 voting system including voter registration, candidate registration, voting, and winner declaration on the Ethereum blockchain.

---

## 🚀 Project Features

- 🧑‍💼 Organizer-controlled voter & candidate authorization  
- 🗳️ Secure on-chain voting (1 voter = 1 vote)  
- 🏆 Automatic winner calculation (No votes / Tie / Winner)  
- 🖼️ IPFS image & metadata storage (Pinata)  
- 🔐 MetaMask wallet authentication  
- ⚡ Built with modern Web3 stack (Next.js + Ethers.js)

---

## 🧱 Tech Stack

- **Frontend**: Next.js, React, CSS Modules  
- **Blockchain**: Solidity, Ethereum / Polygon Mumbai / Ganache  
- **Web3**: Ethers.js, Web3Modal  
- **Storage**: IPFS (Pinata)  
- **Wallet**: MetaMask  
- **Dev Tools**: Hardhat

---

## 📦 Requirements

### 1️⃣ VS Code
https://code.visualstudio.com/download  

### 2️⃣ Node.js & NPM
- Node.js **v18.12.1**  
- NPM **v8.19.2**  
https://nodejs.org/en/download  

### 3️⃣ MetaMask
https://metamask.io/download/

---

## 🔑 External Services

### 📌 Pinata (IPFS)
Used for storing images & metadata.

Create an account at:  
https://www.pinata.cloud/

Add your keys to `.env.local`:
```env
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
NEXT_PUBLIC_PINATA_SECRET=your_secret_key
```

---

## 🧪 Blockchain Network

You can use **Ganache (Local)** or **Polygon Mumbai Testnet**.

### Free Test ETH
https://www.alchemy.com/faucets  

### Polygon Explorer
https://mumbai.polygonscan.com/

---

## 🛠️ Smart Contract Setup (Hardhat)

### Install Hardhat dependencies
```bash
npm install
```

### Compile Contracts
```bash
npx hardhat compile
```

### Deploy Contract (Ganache)
```bash
npx hardhat run scripts/deploy.js --network ganache
```

After deployment:
- Copy **Contract Address**
- Paste them into:
```js
context/constants.js
```

---

## ▶️ Running the Frontend

### Install dependencies
```bash
npm install
```

### Install IPFS client
```bash
npm install ipfs-http-client
```

### Start development server
```bash
npm run dev
```

Open in browser:
```bash
http://localhost:3000
```

---

## 📂 Project Structure

```bash
.
├── contracts/
│   └── Voting.sol
├── scripts/
│   └── deploy.js
├── context/
│   └── Voter.js
├── pages/
│   ├── index.js
│   ├── allowed-voters.js
│   ├── candidate-registration.js
│   ├── voterList.js
│   └── winner.js
├── components/
├── assets/
├── styles/
├── hardhat.config.js
└── README.md
```


