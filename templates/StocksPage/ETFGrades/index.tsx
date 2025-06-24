import React from 'react';
import { Box, Text, Flex, Badge, useColorMode } from '@chakra-ui/react';

const ETFGrades = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const grades = [
        { category: '趋势', now: 'A', threeMonths: 'A+', sixMonths: 'A+', nowColor: 'green.700', pastColor: 'gray.300' },
        { category: '支出', now: 'A-', threeMonths: 'A-', sixMonths: 'B+', nowColor: 'green.700', pastColor: 'gray.300' },
        { category: '股息', now: 'A-', threeMonths: 'B+', sixMonths: 'B+', nowColor: 'green.700', pastColor: 'gray.300' },
        { category: '风险', now: 'C-', threeMonths: 'C', sixMonths: 'C+', nowColor: 'yellow.400', pastColor: 'gray.300' },
        { category: '流动性', now: 'A+', threeMonths: 'A+', sixMonths: 'A+', nowColor: 'green.700', pastColor: 'gray.300' }
    ];

    return (
        <Box p={{ base: 3, md: 6 }} bg={isDark ? 'var(--on-surface-1)' : 'white'} rounded="lg" shadow="md" w="full" minW={0} mb={{ base: 3, md: 6 }}>
            <Flex alignItems="center" mb={{ base: 2, md: 4 }}>
                <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" mr={2} color={isDark ? 'white' : undefined}>ETF Grades</Text>
            </Flex>
            <Flex mb={{ base: 1, md: 2 }}>
                <Text fontSize={{ base: 'sm', md: 'md' }} color={isDark ? 'gray.400' : 'gray.600'} width={{ base: '60px', md: '100px' }}></Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color={isDark ? 'gray.400' : 'gray.600'} width={{ base: '36px', md: '50px' }} textAlign="center">Now</Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color={isDark ? 'gray.400' : 'gray.600'} width={{ base: '36px', md: '50px' }} textAlign="center">3M</Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color={isDark ? 'gray.400' : 'gray.600'} width={{ base: '36px', md: '50px' }} textAlign="center">6M</Text>
            </Flex>
            {grades.map((grade, index) => (
                <Flex key={index} alignItems="center" mb={{ base: 1, md: 2 }}>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color={isDark ? 'gray.400' : 'gray.600'} width={{ base: '60px', md: '100px' }}>{grade.category}</Text>
                    <Flex alignItems="center" bg={grade.nowColor} color="white" px={{ base: 2, md: 3 }} py={1} borderRadius="md" width={{ base: '36px', md: '50px' }} justifyContent="center">
                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">{grade.now}</Text>
                    </Flex>
                    <Flex alignItems="center" bg={isDark ? 'gray.600' : grade.pastColor} color={isDark ? 'gray.100' : 'black'} px={{ base: 2, md: 3 }} py={1} borderRadius="md" width={{ base: '36px', md: '50px' }} justifyContent="center" mx={2}>
                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">{grade.threeMonths}</Text>
                    </Flex>
                    <Flex alignItems="center" bg={isDark ? 'gray.600' : grade.pastColor} color={isDark ? 'gray.100' : 'black'} px={{ base: 2, md: 3 }} py={1} borderRadius="md" width={{ base: '36px', md: '50px' }} justifyContent="center">
                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">{grade.sixMonths}</Text>
                    </Flex>
                </Flex>
            ))}
        </Box>
    );
};

export default ETFGrades;