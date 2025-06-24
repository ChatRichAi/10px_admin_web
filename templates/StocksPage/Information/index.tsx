import React from 'react';
import { Box, Text, Grid, GridItem, Icon, Flex, Badge, useColorMode } from '@chakra-ui/react';
import { FaBullhorn, FaChartLine, FaArrowDown, FaArrowUp } from 'react-icons/fa';

const articles = [
    {
        title: 'Invesco QQQ Trust 宣布季度派息 0.6769 美元',
        author: 'SA 新闻',
        date: '9月23日',
        comments: 8,
        icon: FaBullhorn,
        tag: 'buy'
    },
    {
        title: '美联储降息 50 个基点对股市来说并非利好空事件',
        author: 'Hugo Ferrer',
        date: '9月20日',
        comments: 13,
        icon: FaChartLine,
        tag: 'hold'
    },
    {
        title: '周期结束更近一步：收益率曲线已不再倒挂',
        author: 'Hugo Ferrer',
        date: '9月13日',
        comments: 20,
        icon: FaChartLine,
        tag: 'hold'
    },
    {
        title: '市场崩溃或爆炸的帷幕即将拉开',
        author: '更新深焦',
        date: '9月10日',
        comments: 31,
        icon: FaArrowDown,
        tag: 'hold'
    },
    {
        title: 'QQQ：价格极度高估（评级下调）',
        author: 'AJ Button',
        date: '9月9日',
        comments: 25,
        icon: FaArrowDown,
        tag: 'sell'
    },
    {
        title: 'QQQ：未来将进一步走弱',
        author: 'Josh Arnold',
        date: '9月4日',
        comments: 11,
        icon: FaArrowDown,
        tag: 'sell'
    },
    {
        title: '2024年8月起的市场和经济洞察',
        author: '宏观洞察',
        date: '9月3日',
        comments: 10,
        icon: FaChartLine,
        tag: 'hold'
    },
    {
        title: '美联储降息和选举年焦虑（QQQ评级下调）',
        author: 'LEL Investment LLC',
        date: '9月2日',
        comments: 2,
        icon: FaArrowDown,
        tag: 'sell'
    },
    {
        title: 'QQQ：如果实现策略会怎样？',
        author: 'Sensor Unlimited',
        date: '9月1日',
        comments: 0,
        icon: FaChartLine,
        tag: 'hold'
    }
];

const Information = () => {
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    return (
        <Box p={6} bg={isDark ? 'var(--on-surface-1)' : 'white'} rounded="lg" shadow="md">
            <Text fontSize="2xl" fontWeight="bold" mb={6} color={isDark ? 'gray.100' : undefined}>消息</Text>
            <Grid templateColumns="1fr" gap={4}>
                {articles.map((article, index) => (
                    <GridItem
                        key={index}
                        p={4}
                        borderRadius="lg"
                        boxShadow="md"
                        bg={isDark ? 'var(--on-surface-2)' : 'white'}
                        cursor="pointer"
                        _hover={{ boxShadow: "lg", transform: "scale(1.02)" }}
                    >
                        <Flex mb={2}>
                            <Icon as={article.icon} w={6} h={6} mr={4} color={isDark ? 'gray.200' : undefined} />
                            <Box flex="1">
                                <Text fontWeight="bold" color={isDark ? 'gray.100' : undefined}>{article.title}</Text>
                                <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>{article.author} · {article.date} · {article.comments}条评论</Text>
                            </Box>
                        </Flex>
                        <Badge
                            bg={article.tag === 'buy' ? 'green.500' : article.tag === 'sell' ? 'red.500' : 'yellow.500'}
                            color="white"
                            variant="solid"
                            fontSize="0.7em"
                            px={3}
                            py={1}
                            borderRadius="full"
                            fontWeight="bold"
                        >
                            {article.tag.charAt(0).toUpperCase() + article.tag.slice(1)}
                        </Badge>
                    </GridItem>
                ))}
            </Grid>
        </Box>
    );
};

export default Information;