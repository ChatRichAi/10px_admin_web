"use client";

import Layout from "@/components/Layout";
import Prices from "./Prices";
import NeuraAI from "./NeuraAI";
import AvailableBalance from "./AvailableBalance";
import Total from "./Total"; // 导入 Total 组件

const TradePage = () => {
    return (
        <Layout title="Trade">
            <div className="flex flex-wrap items-start lg:block">
                <div className="card grow">
                    <Prices />
                    <div className="h-0.25 mt-4 -mx-6 bg-theme-stroke"></div>
                    <NeuraAI />
                </div>
                <AvailableBalance />
                <Total /> {/* 添加 Total 组件 */}
            </div>
        </Layout>
    );
};

export default TradePage;