import React, { useState, useContext, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AiFillLock, AiFillUnlock } from "react-icons/ai";

// INTERNAL IMPORT
import { VotingContext } from "../../context/Voter";
import Style from "./NavBar.module.css";
import flag from "../../assets/sri-lanka.gif";

const NavBar = () => {
  const { connectWallet, error, currentAccount, setError } =
    useContext(VotingContext);

  const [openNav, setOpenNav] = useState(false);
  const navRef = useRef(null);

  const openNavigation = () => {
    if (openNav) {
      setOpenNav(false);
    } else if (!openNav) {
      setOpenNav(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenNav(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={Style.navbar}>
      {error && (
        <div className={Style.error_overlay}>
          <div className={Style.error_modal}>
            <h3>Action Not Allowed</h3>
            <p>{error}</p>
            <button onClick={() => setError("")}>OK</button>
          </div>
        </div>
      )}

      <div className={Style.navbar_box}>
        <di className={Style.tittle}>
          <Link href={{ pathname: "/" }}>
            <Image src={flag} alt="logo" width={130} height={80} />
          </Link>
        </di>

        <div className={Style.connect} ref={navRef}>
          {currentAccount ? (
            <div>
              <div className={Style.connect_flex}>
                <button onClick={() => openNavigation()}>
                  {currentAccount.slice(0, 10)}...
                </button>
                {currentAccount && (
                  <span>
                    {openNav ? (
                      <AiFillUnlock onClick={() => openNavigation()} />
                    ) : (
                      <AiFillLock onClick={() => openNavigation()} />
                    )}
                  </span>
                )}
              </div>
              {openNav && (
                <div className={Style.navigation}>
                  <p>
                    <Link href={{ pathname: "/" }}>Home</Link>
                  </p>
                  <p>
                    <Link href={{ pathname: "candidate-registration" }}>
                      Candidate Registration
                    </Link>
                  </p>
                  <p>
                    <Link href={{ pathname: "allowed-voters" }}>
                      Voter Registration
                    </Link>
                  </p>
                  <p>
                    <Link href={{ pathname: "voterList" }}>Voter List</Link>
                  </p>
                  <p>
                    <Link href={{ pathname: "winner" }}>Winner</Link>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => connectWallet()}>Connect Wallet</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
