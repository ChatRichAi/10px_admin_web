import React from 'react';
import { Box, Text, SimpleGrid, Button, useColorMode } from '@chakra-ui/react';
import Card from "@/components/Card";

const statisticsData = [
    { label: '总盈亏', value: '+$10000.00', color: 'green.500' },
    { label: '交易预期', value: '27.15', color: 'gray.500' },
    { label: '日均收益', value: '+$50.00', color: 'green.500' },
    { label: '日均成交量', value: '$8584.18', color: 'gray.500' },
    { label: '最大收益', value: '+$500.00', color: 'green.500' },
    { label: '最大亏损', value: '-$300.00', color: 'red.500' },
    { label: '日均交易次数', value: '0.5 (200天)', color: 'gray.500' },
    { label: '平均交易盈利', value: '+$250.00', color: 'green.500' },
    { label: '平均交易亏损', value: '$150.00', color: 'red.500' },
    { label: '最大连续盈利', value: '3', color: 'gray.500' },
    { label: '最大连续亏损', value: '5', color: 'gray.500' },
    { label: '总交易量', value: '$200.00万', color: 'gray.500' },
];

const Statistics = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    return (
        <Card
            className={`grow ${isDark ? 'bg-theme-on-surface-2' : ''}`}
            title="统计"
        >
            <Box height="17.5rem" overflowY="auto" mt={4} mb={4}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacingY={4} spacingX={4}>
                    {statisticsData.map((stat, index) => (
                        <Box key={index} display="flex" justifyContent="space-between" py={2}>
                            <Text fontSize="sm" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.600'}>{stat.label}</Text>
                            <Text fontSize="sm" color={stat.color} fontWeight="bold">{stat.value}</Text>
                        </Box>
                    ))}
                </SimpleGrid>
            </Box>
            <Button mt={2} colorScheme={isDark ? 'gray' : 'gray'} variant={isDark ? 'outline' : 'solid'} width="full" className="btn-gray w-full">更多数据</Button>
        </Card>
    );
};

export default Statistics;