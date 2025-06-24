"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import TabsSame from "@/components/TabsSame";
import PricingCard from "@/components/PricingCard";

import { pricing } from "@/mocks/pricing";

const PricingPage = () => {
    const [type, setType] = useState<string>("monthly");

    const typeTasks = [
        {
            title: "按月付费",
            value: "monthly",
        },
        {
            title: "按年付费",
            value: "yearly",
        },
    ];

    return (
        <Layout title="会员中心">
            <div className="pt-12 md:pt-6">
                <div className="mb-14 text-center 2xl:mb-10 md:mb-6 md:text-left">
                    <div className="mb-3 text-h1 2xl:text-h2 md:text-h3">
                        自然语言量化大模型
                    </div>
                    <div className="mb-6 text-[1.25rem] leading-[2rem] font-medium text-theme-secondary">
                        强大工具助力您的交易体验
                    </div>
                    <TabsSame
                        className="max-w-[18.5rem] mx-auto shadow-[0_0_0_0.0625rem_#EFEFEF] md:max-w-full dark:shadow-[0_0_0_0.0625rem_#272B30]"
                        items={typeTasks}
                        value={type}
                        setValue={setType}
                    />
                </div>
                <div className="flex max-w-[65.6875rem] mx-auto space-x-6 lg:block lg:max-w-[25rem] lg:space-x-0 lg:space-y-6">
                    {pricing.filter(item => item.id !== 'free').map((item) => (
                        <PricingCard
                            key={item.id}
                            plan={item.id as any}
                            title={item.title}
                            description={item.description}
                            image={item.image}
                            priceMonthly={item.priceMonthly}
                            priceYearly={item.priceYearly}
                            features={item.options}
                            popular={item.popular}
                            billingType={type as 'monthly' | 'yearly'}
                        />
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export default PricingPage;
