import React, { useEffect, useContext } from "react";
import Countdown from "react-countdown";
import Card from "../components/card/card";

// Internal Imports
import { VotingContext } from "../context/Voter";
import Style from "../styles/index.module.css";

const index = () => {
  const {
    getNewCandidate,
    candidateArray,
    giveVote,
    checkIfWalletIsConnected,
    candidateLength,
    voterLength,
    currentAccount,
    getAllVoterData,
  } = useContext(VotingContext);

  console.log("Candidate Length: ", candidateLength);

  useEffect(() => {
    checkIfWalletIsConnected();
    getNewCandidate();
    getAllVoterData();
  }, []);

  let winnerData = null;
  let isTie = false;
  let hasVotes = false;

  if (candidateArray && candidateArray.length) {
    const voteCounts = candidateArray.map((c) => c[4].toNumber());

    const maxVotes = Math.max(...voteCounts);
    hasVotes = maxVotes > 0;

    if (hasVotes) {
      const topCandidates = candidateArray.filter(
        (c) => c[4].toNumber() === maxVotes,
      );

      if (topCandidates.length === 1) {
        winnerData = {
          candidate: topCandidates[0],
          votes: maxVotes,
        };
      } else {
        isTie = true;
      }
    }
  }

  return (
    <>
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

        {winnerData && !isTie && (
          <div className={Style.winner_card}>
            <h3 className={Style.winner_card_title}>Winner</h3>

            <div className={Style.winner_card_box}>
              <div className={Style.winner_card_image}>
                <img src={winnerData.candidate[3]} alt="Winner profile" />
              </div>

              <div className={Style.winner_card_info}>
                <p>
                  Name: {winnerData.candidate[1]} #
                  {winnerData.candidate[2].toNumber()}
                </p>
                <p>Party: {winnerData.candidate[0]}</p>
                <p>Address: {winnerData.candidate[6].slice(0, 30)}...</p>
              </div>

              <div className={Style.winner_card_votes}>
                <p className={Style.winner_card_label}>Total Votes</p>
                <p className={Style.winner_card_count}>{winnerData.votes}</p>
              </div>
            </div>
          </div>
        )}

        {isTie && (
          <div className={Style.result_card}>
            <h3 className={Style.result_title}>Election Result</h3>

            <div className={Style.result_box}>
              <p className={Style.result_status}>Tie Declared</p>
              <p className={Style.result_message}>
                All candidates received an equal number of votes.
                <br />
                No winner can be determined at this time.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default index;
