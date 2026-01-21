import React, {useEffect, useContext} from "react";
import Countdown from "react-countdown";
import Card from "../components/card/card";

// Internal Imports
import {VotingContext} from "../context/Voter";
import Style from "../styles/index.module.css";


const index = () => {
  const {getNewCandidate, candidateArray, giveVote, checkIfWalletIsConnected, candidateLength, voterLength, currentAccount, getAllVoterData} = useContext(VotingContext);
  console.log("Candidate Length: ", candidateLength)
  useEffect(() => {
    checkIfWalletIsConnected();
    getNewCandidate();   // ✅ THIS WAS MISSING
    getAllVoterData();
  }, []);

  const winnerData = candidateArray && candidateArray.length
    ? candidateArray.reduce((winner, candidate) => {
      const votes = candidate[4].toNumber();
      if (!winner || votes > winner.votes) {
        return {candidate, votes};
      }
      return winner;
    }, null)
    : null;

  return <>
    <div className={Style.home}>
      {currentAccount && (
        <div className={Style.winner}>
          <div className={Style.winner_info}>
            <div className={Style.candidate_list}>
              <p>
                No Candidate: <span>{candidateLength}</span>
              </p>
            </div>
            <div className={Style.candidate_list}>
              <p>
                No Voter: <span>{voterLength}</span>
              </p>
            </div>
          </div>
          <div className={Style.winner_message}>
            <small>
              <Countdown date={Date.now() + 10000000}></Countdown>
            </small>
          </div>
        </div>
      )}

      <Card candidateArray={candidateArray} giveVote={giveVote} />

      {winnerData && (
        <div className={Style.winner_card}>
          <h3 className={Style.winner_card_title}>Winner</h3>
          <div className={Style.winner_card_box}>
            <div className={Style.winner_card_image}>
              <img src={winnerData.candidate[3]} alt="Winner profile" />
            </div>
            <div className={Style.winner_card_info}>
              <p>
                Name: {winnerData.candidate[1]} # {winnerData.candidate[2].toNumber()}
              </p>
              <p>Age: {winnerData.candidate[0]}</p>
              <p>Address: {winnerData.candidate[6].slice(0, 30)}...</p>
            </div>
            <div className={Style.winner_card_votes}>
              <p className={Style.winner_card_label}>Total Votes</p>
              <p className={Style.winner_card_count}>{winnerData.votes}</p>
            </div>
          </div>
        </div>
      )}
      
    </div>

  </>;
};

export default index;
