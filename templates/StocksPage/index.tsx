"use client";

import React, { useState } from 'react';
import Layout from "@/components/Layout";
import OptionsControl from "./OptionsControl";
import News from "./News"; // 引入 News 组件
import TotalBalance from "./TotalBalance";
import Information from "./Information";
import RatingSummary from "./Rating"; // 引入 RatingSummary 组件
import ETFGrades from "./ETFGrades"; // 引入 ETFGrades 组件
import Quant from "./Quant"; // 引入 Quant 组件
import TradePlan from "./TradePlan"; // 引入 TradePlan 组件

const StocksPage = () => {
    const [selectedOption, setSelectedOption] = useState('概括');
    const [subOption, setSubOption] = useState('全部');

    const handleOptionChange = (option: string, subOption: string) => {
        setSelectedOption(option);
        setSubOption(subOption);
    };

    return (
        <Layout title="My assets">
            <div className="space-y-2">
                <div className="flex gap-4 mt-6 mb-6">
                    <div className="flex-1">
                        <OptionsControl onOptionChange={handleOptionChange} />
                    </div>
                </div>
                <div className="flex gap-4 mt-6 mb-6">
                    <div className="w-4/5"> {/* 设置 TotalBalance 宽度为 80% */}
                        <TotalBalance />
                        <div className="flex gap-4 mt-6"> {/* 将 News 和 Information 放在 TotalBalance 下方 */}
                            <div className="w-1/2"> {/* 设置 News 宽度为 50% */}
                                <News /> {/* 使用 News 组件 */}
                            </div>
                            <div className="w-1/2"> {/* 设置 Information 宽度为 50% */}
                                <Information />
                            </div>
                        </div>
                    </div>
                    <div className="w-1/5 sticky top-0"> {/* 设置 RatingSummary 和 ETFGrades 宽度为 20%，并固定在屏幕上 */}
                        <div className="space-y-4">
                            <RatingSummary /> {/* 使用 RatingSummary 组件 */}
                            <ETFGrades /> {/* 使用 ETFGrades 组件 */}
                            <Quant /> {/* 使用 Quant 组件 */}
                            <TradePlan /> {/* 使用 TradePlan 组件 */}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StocksPage;