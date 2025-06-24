import React from 'react';
import { Box, Text, Flex, Link, useColorMode } from '@chakra-ui/react';

const TradePlan = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    return (
        <Box p={{ base: 3, md: 6 }} bg={isDark ? 'var(--on-surface-1)' : 'white'} rounded="lg" shadow="md" w="full" minW={0} mb={{ base: 3, md: 6 }}>
            <Text fontSize={{ base: 'lg', md: '2xl' }} fontWeight="bold" mb={{ base: 2, md: 4 }} color={isDark ? 'white' : undefined}>扫描信号</Text>
            <Flex justifyContent="space-between" mb={2} px={2}>
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color={isDark ? 'gray.400' : 'gray.600'}>标的</Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color={isDark ? 'gray.400' : 'gray.600'}>价格</Text>
                <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="medium" color={isDark ? 'gray.400' : 'gray.600'}>波动</Text>
            </Flex>
            {[
                { name: 'BTCUSDT', desc: 'SPDR® 标准普尔 500® ETF 信托', price: '571.66', change: '0.03%', changeColor: 'green.500' },
                { name: '互联网财富...', desc: '先锋标准普500 ETF', price: '525.44', change: '0.01%', changeColor: 'green.500' },
                { name: '阿尔卡', desc: 'iShares Russell 2000 ETF', price: '221.09', change: '0.34%', changeColor: 'green.500' },
                { name: '迪亚', desc: 'SPDR® 道琼斯工业平均指数 ETF 信托', price: '421.78', change: '-0.28%', changeColor: 'red.500' },
                { name: '阿尔卡', desc: 'ARK 创新ETF', price: '47.55', change: '-0.69%', changeColor: 'red.500' },
            ].map((item, idx) => (
                <Flex key={item.name + idx} alignItems="center" justifyContent="space-between" py={3} px={2} borderBottom={idx < 4 ? (isDark ? '1px solid #2D3748' : '1px solid #EDF2F7') : undefined}>
                    <Box minW={{ base: '80px', md: '120px' }}>
                        <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color={isDark ? 'gray.400' : 'gray.600'}>{item.name}</Text>
                        <Text fontSize={{ base: 'xs', md: 'sm' }} color={isDark ? 'gray.400' : 'gray.500'} mt={1}>{item.desc}</Text>
                </Box>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color={isDark ? 'gray.100' : undefined} minW={{ base: '56px', md: '72px' }} textAlign="right">{item.price}</Text>
                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color={item.changeColor} minW={{ base: '56px', md: '72px' }} textAlign="right">{item.change}</Text>
            </Flex>
            ))}
            <Box textAlign="center" mt={4}>
                <Link
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontWeight="bold"
                    color={isDark ? 'gray.900' : 'white'}
                    bg={isDark ? 'gray.100' : 'black'}
                    p={3}
                    rounded="md"
                    href="#"
                    _hover={{ bg: isDark ? 'gray.300' : 'gray.700' }}
                    className="btn bg-black text-white w-40 h-12 rounded-full text-sm flex items-center justify-center mx-auto"
                    style={{ fontSize: '14px', fontWeight: '500' }}
                >
                    比较
                </Link>
            </Box>
        </Box>
    );
};

export default TradePlan;