"use client";

import { useState, useEffect, useRef } from "react";
import { Checkbox, Button, Box, VStack, CheckboxProps, Icon } from "@chakra-ui/react";
import { AddIcon, CheckIcon, HamburgerIcon } from "@chakra-ui/icons";
import Layout from "@/components/Layout";
import Balance from "./Balance";
import TopTokens from "./TopTokens";
import GreedIndex from "./GreedIndex";
import RecentActivities from "./RecentActivities";
import NeuraAI from "./NeuraAI";
import TrendBoard from "./QsIndex"; // 导入TrendBoard模块test
import TechnicalIndicatorsBoard from "./TidIndex"; // 导入TechnicalIndicatorsBoard模块
import { PivotPointsBoard } from "./SrIndex"; // 确保正确导入PivotPointsBoard模块

const HomePage = () => {
    const [showTrendBoard, setShowTrendBoard] = useState(true);
    const [showTechnicalIndicatorsBoard, setShowTechnicalIndicatorsBoard] = useState(true);
    const [showPivotPointsBoard, setShowPivotPointsBoard] = useState(true);
    const [showModuleMenu, setShowModuleMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowModuleMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const CustomCheckbox = (props: CheckboxProps) => (
        <Checkbox
            icon={<CheckIcon />}
            iconColor={props.isChecked ? "#0C68E9" : "gray.400"}
            colorScheme="blue"
            {...props}
        />
    );

    return (
        <Layout title="Dashboard">
            <div className="space-y-2">
                <div className="flex space-x-2 lg:block lg:space-x-0 lg:space-y-2">
                    <div className="flex-1">
                        <Balance />
                    </div>
                    <div className="flex-1">
                        {showTrendBoard && <TrendBoard />}
                    </div>
                </div>
                <div className="flex space-x-2 lg:block lg:space-x-0 lg:space-y-2">
                    <TopTokens />
                    <GreedIndex />
                </div>
                <div className="flex -mx-1 lg:block lg:mx-0 lg:space-y-2">
                    <RecentActivities />
                    <NeuraAI />
                </div>
                <div className="flex space-x-2 lg:block lg:space-x-0 lg:space-y-2">
                    {showTechnicalIndicatorsBoard && <TechnicalIndicatorsBoard />}
                </div>
                <div className="flex space-x-3 lg:block lg:space-x-0 lg:space-y-3">
                    {showPivotPointsBoard && <PivotPointsBoard />}
                </div>
            </div>


            {/* 添加删除模块菜单 */}
            <Box position="fixed" bottom="8" right="8" zIndex={1000}>
                <Button
                    bg="#0C68E9"
                    color="white"
                    size="lg"
                    width="48px"
                    height="48px"
                    borderRadius="full"
                    boxShadow="lg"
                    _hover={{ bg: "#0A5AC7" }}
                    onClick={() => setShowModuleMenu(!showModuleMenu)}
                >
                    <HamburgerIcon boxSize={6} /> {/* 将AddIcon替换为HamburgerIcon */}
                </Button>
                {showModuleMenu && (
                    <Box
                        ref={menuRef}
                        position="absolute"
                        bottom="20"
                        right="0"
                        bg="white"
                        boxShadow="lg"
                        borderRadius="lg"
                        p="4"
                        w="48"
                        transition="all 0.3s"
                        transform="translateY(2)"
                    >
                        <VStack spacing={2} align="start">
                            <CustomCheckbox
                                isChecked={showTechnicalIndicatorsBoard}
                                onChange={() => setShowTechnicalIndicatorsBoard(!showTechnicalIndicatorsBoard)}
                            >
                                技术指标看板
                            </CustomCheckbox>
                            <CustomCheckbox
                                isChecked={showPivotPointsBoard}
                                onChange={() => setShowPivotPointsBoard(!showPivotPointsBoard)}
                            >
                                支撑阻力看板
                            </CustomCheckbox>
                        </VStack>
                    </Box>
                )}
            </Box>
        </Layout>
    );
};

export default HomePage;