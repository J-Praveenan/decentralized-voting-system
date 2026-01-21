import "../styles/globals.css";

//INTERNAL IMPORT
import { VotingProvider } from "../context/Voter";
import NavBar from "../components/NavBar/NavBar";

const MyApp = ({ Component, pageProps }) => (
    <VotingProvider>
        <NavBar/>
        <div>
            <Component {...pageProps} />
        </div>
        
    </VotingProvider>
);

export default MyApp;
