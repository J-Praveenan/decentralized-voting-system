import React, { useEffect, useState, useContext } from "react";
import { VotingContext } from "../context/Voter";
import Style from "../styles/winner.module.css";

const WinnerClient = () => {
  const { getWinner } = useContext(VotingContext);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadWinner = async () => {
      const res = await getWinner();
      setResult(res);
    };
    loadWinner();
  }, []);

  if (!result) return <p>Loading result...</p>;

  if (result.status === "NO_VOTES") {
    return <p>No votes have been cast yet.</p>;
  }

  if (result.status === "TIE") {
    return (
      <div className={Style.winner}>
        <h1>⚖️ Election Result</h1>
        <p>The election resulted in a tie.</p>
        <p>Top Votes: {result.votes}</p>
      </div>
    );
  }

  const winner = result.data;

  return (
    <div className={Style.winner}>
      <h1>🏆 Election Winner</h1>
      <img src={winner.image} alt="winner" />
      <h2>{winner.name}</h2>
      <p>Candidate ID: {winner.id}</p>
      <p>Address: {winner.address.slice(0, 30)}...</p>
      <p>Total Votes: {winner.votes}</p>
    </div>
  );
};

export default WinnerClient;
