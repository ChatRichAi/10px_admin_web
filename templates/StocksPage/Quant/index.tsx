import React from 'react';
import { Box, Text, Flex, Link, useColorMode } from '@chakra-ui/react';

const Quant = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    return (
        <Box p={{ base: 3, md: 6 }} bg={isDark ? 'var(--on-surface-1)' : 'white'} rounded="lg" shadow="md" w="full" minW={0} mb={{ base: 3, md: 6 }}>
            <Flex alignItems="center" mb={{ base: 2, md: 4 }}>
                <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" mr={2} color={isDark ? 'gray.100' : undefined}>量化排名</Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} color={isDark ? 'gray.400' : 'gray.500'} ml={2}>?</Text>
            </Flex>
            <Box>
                {[
                    { label: '资产类别', value: '美国股票' },
                    { label: '子类', value: '大幅增长' },
                    { label: '总体排名', value: '2607人中188人' },
                    { label: '按资产类别排名', value: '617人中27人' },
                    { label: '子类别排名', value: '90分中的18分' },
                ].map((item, idx) => (
                    <Flex key={item.label} justifyContent="space-between" alignItems="center" py={2} borderBottom={idx < 4 ? (isDark ? '1px solid #2D3748' : '1px solid #EDF2F7') : undefined}>
                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color={isDark ? 'gray.400' : 'gray.600'} minW={{ base: '80px', md: '100px' }}>{item.label}</Text>
                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color={isDark ? 'white' : 'blue.600'} textAlign="right">{item.value}</Text>
            </Flex>
                ))}
            </Box>
            <Box textAlign="right" mt={4}>
                <Link fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color={isDark ? 'white' : 'blue.600'} href="#">量化评级超越市场 »</Link>
            </Box>
        </Box>
    );
};

export default Quant;