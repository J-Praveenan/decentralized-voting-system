import React, { useEffect, useState, useContext } from "react";
import { VotingContext } from "../context/Voter";
import Style from "../styles/winner.module.css";

const Winner = () => {
  const { getWinner } = useContext(VotingContext);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const loadWinner = async () => {
      const result = await getWinner();
      setWinner(result);
    };
    loadWinner();
  }, []);

  if (!winner) return <p>Loading winner...</p>;

  return (
    <div className={Style.winner}>
      <h1>🏆 Election Winner</h1>

      <img src={winner.image} alt="winner" />

      <h2>{winner.name}</h2>
      <p>Candidate ID: {winner.id}</p>
      <p>Address: {winner.address.slice(0, 30)}.....</p>
      <p>Total Votes: {winner.votes}</p>
    </div>
  );
};

export default Winner;
