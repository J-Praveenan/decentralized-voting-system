import dynamic from "next/dynamic";

const Winner = dynamic(() => import("../components/winnerClient"), {
  ssr: false,
});

export default Winner;
