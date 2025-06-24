import React from 'react';
import { Box, Text, Flex, Badge, useColorMode } from '@chakra-ui/react';

const RatingSummary = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const ratings = [
        { type: '分析师', status: 'Hold', score: 2.86, statusColor: isDark ? 'yellow.600' : 'yellow.400', scoreColor: isDark ? 'yellow.700' : 'yellow.600' },
        { type: '量化', status: 'Buy', score: 4.18, statusColor: isDark ? 'green.700' : 'green.500', scoreColor: isDark ? 'green.800' : 'green.700' }
    ];

    return (
        <Box p={{ base: 3, md: 6 }} bg={isDark ? 'var(--on-surface-1)' : 'white'} rounded="lg" shadow="md" w="full" minW={0} mb={{ base: 3, md: 6 }}>
            <Flex alignItems="center" mb={{ base: 2, md: 4 }}>
                <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" mr={2} color={isDark ? 'white' : undefined}>评级摘要</Text>
            </Flex>
            {ratings.map((rating, index) => (
                <Flex key={index} alignItems="center" mb={{ base: 1, md: 2 }}>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color={isDark ? 'gray.400' : 'gray.600'} width={{ base: '80px', md: '100px' }}>{rating.type}</Text>
                    <Flex alignItems="center" bg={rating.statusColor} color={isDark ? 'gray.100' : 'black'} px={{ base: 2, md: 3 }} py={1} borderRadius="md" mx={2} minW="48px" justifyContent="center">
                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">{rating.status}</Text>
                    </Flex>
                    <Flex alignItems="center" bg={rating.scoreColor} color="white" px={{ base: 2, md: 3 }} py={1} borderRadius="md" minW="48px" justifyContent="center">
                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold">{rating.score}</Text>
                    </Flex>
                </Flex>
            ))}
        </Box>
    );
};

export default RatingSummary;