// 首页
import type { NextPage } from "next";
import HomePage from "@/templates/HomePage";
import GlobalErrorSilencer from "@/components/GlobalErrorSilencer";

const Home: NextPage = () => {
    return <>
      <GlobalErrorSilencer />
      <HomePage />
    </>;
};

export default Home;
