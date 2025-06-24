export const pricing = [
    {
        id: "free",
        popular: false,
        active: false,
        title: "免费版",
        image: "/images/plan-starter.png",
        priceMonthly: 0,
        priceYearly: 0,
        description:
            "基础功能，适合初学者了解平台。",
        options: [
            "基础市场数据查看",
            "简单价格提醒",
            "基础教程和帮助",
        ],
    },
    {
        id: "starter",
        popular: false,
        active: true,
        title: "入门版",
        image: "/images/plan-starter.png",
        priceMonthly: 128,
        priceYearly: 1280,
        description:
            "为初学者量身打造，入门版为您开启进阶加密货币交易工具与AI智能分析。",
        options: [
            "实时价格预警",
            "基础资产分析",
            "AI预测分析",
            "有限自动化交易",
        ],
    },
    {
        id: "standard",
        popular: true,
        active: false,
        title: "标准版",
        image: "/images/plan-standard.png",
        priceMonthly: 198,
        priceYearly: 1980,
        description:
            "深度市场分析与高级AI预测，助力资深交易者优化策略。",
        options: [
            "包含入门版全部功能",
            "市场深度分析",
            "高级资产分析",
            "增强版AI预测分析",
            "高级图表工具",
        ],
    },
    {
        id: "pro",
        popular: false,
        active: false,
        title: "专业版",
        image: "/images/plan-pro.png",
        priceMonthly: 498,
        priceYearly: 4980,
        description:
            "丰富的交易资源、专属洞见、尊享客服与独家活动。",
        options: [
            "包含标准版全部功能",
            "无限制自动化交易",
            "API访问权限",
            "高优先级客户支持",
            "专属客户经理",
        ],
    },
];
