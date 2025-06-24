import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Card from "@/components/Card";

const data = [
    { name: "极度恐惧", value: 100 },
    { name: "恐惧", value: 200 },
    { name: "中性", value: 300 },
    { name: "贪婪", value: 400 },
    { name: "极度贪婪", value: 500 },
];

const COLORS = ["#00FF00", "#7FFF00", "#FFFF00", "#FF7F00", "#FF0000"];
const LABELS = ["极度恐惧", "恐惧", "中性", "贪婪", "极度贪婪"];

type GreedIndexProps = {};

type IndexData = {
    value: string | null;  // 修改为字符串类型以匹配API返回的数据
};

const GreedIndex = ({ }: GreedIndexProps) => {
    const [indexData, setIndexData] = useState<IndexData | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/cgAPI/fear-greed-index');
                const result = await response.json();
                // 假设API返回的数据结构为 { value: "50" }
                setIndexData({ value: result.value });
            } catch (error) {
                console.error("Error fetching the fear-greed index:", error);
            }
        };

        fetchData();
    }, []);

    // 计算突出显示的索引
    const calculateHighlightIndex = (value: string | null) => {
        if (value === null) return -1;
        const numericValue = parseInt(value, 10);
        if (numericValue <= 20) return 0;
        if (numericValue <= 40) return 1;
        if (numericValue <= 60) return 2;
        if (numericValue <= 80) return 3;
        return 4;
    };

    const highlightIndex = calculateHighlightIndex(indexData ? indexData.value : null);

    return (
        <Card
            className="flex-1"
            title="恐惧&贪婪指数"
            tooltip="用于识别市场情绪值"
            seeAllUrl="/greed-index"
        >
            <div className="md:-mx-2">
                <div className="relative w-80 h-40 mt-14 mx-auto lg:my-8 md:mt-6 md:mb-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart width={800} height={400}>
                            <Pie
                                data={data}
                                cx={155}
                                cy={160}
                                startAngle={180}
                                endAngle={0}
                                innerRadius={128}
                                outerRadius={160}
                                fill="#8884d8"
                                paddingAngle={1}
                                dataKey="value"
                                stroke="transparent"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke={index === highlightIndex ? "white" : "transparent"}
                                        strokeWidth={index === highlightIndex ? 4 : 1}
                                        style={{
                                            transform: index === hoveredIndex ? "scale(1.05)" : "scale(1)",
                                            transition: "transform 0.3s ease",
                                            filter: index === highlightIndex ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.2))" : "none"
                                        }}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 text-center">
                        <div className="text-h1 md:text-h2">
                            {indexData && indexData.value !== null ? indexData.value : <span style={{ fontSize: '0.5em' }}>Loading...</span>}
                        </div>
                        <div className="text-title-1m text-theme-secondary">
                            {hoveredIndex !== null ? LABELS[hoveredIndex] : LABELS[highlightIndex]}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default GreedIndex;