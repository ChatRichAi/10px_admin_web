import React, { useState, useEffect } from 'react';
import { Box, Text, useColorMode } from '@chakra-ui/react';

interface OptionsControlProps {
    onOptionChange: (option: string, subOption: string) => void;
}

const OptionsControl: React.FC<OptionsControlProps> = ({ onOptionChange }) => {
    const [selectedOption, setSelectedOption] = useState('概括');
    const [subOption, setSubOption] = useState('全部');
    const { colorMode } = useColorMode();
    const isDark = colorMode === 'dark';

    useEffect(() => {
        if (selectedOption !== '概括') {
            setSubOption('');
        }
        onOptionChange(selectedOption, subOption);
    }, [selectedOption, subOption, onOptionChange]);

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
    };

    const handleSubOptionClick = (option: string) => {
        setSubOption(option);
    };

    const subOptions = {
        '概括': ['全部', '分析', '评论', '消息', '成绩单', 'SEC文件', '新闻稿', '相关分析'],
        '持仓': [], // 添加持仓子选项
        '评级': ['量化评级', 'SA 分析师评级', '华尔街分析师评级'],
        '财务': ['损益表', '资产负债表', '现金周转'],
        '收益': ['收益摘要', '盈利预测', '盈利修正', '盈利惊喜', '成绩单'],
        '股息': [], // 添加股息子选项
        '估值': ['等级指标', '市盈率', '资本结构'],
        '生长': [], // 添加生长子选项
        '盈利能力': [], // 添加盈利能力子选项
        '势头': [], // 添加势头子选项
        '同行': ['统计数据对比', '相关标的', '相关ETF'],
        '选项': [], // 添加选项子选项
        '制图': [] // 添加制图子选项
    };

    return (
        <Box p={6} bg={isDark ? 'var(--on-surface-1)' : 'white'} rounded="lg" shadow="lg">
            <Text fontSize="2xl" fontWeight="bold" mb={6} color={isDark ? 'gray.100' : undefined}>U - Unity 软件公司</Text>
            <Box display="flex" alignItems="baseline" mb={2}>
                <Text fontSize="4xl" fontWeight="bold" color={isDark ? 'gray.100' : 'black'} mr={2}>21.89美元</Text>
                <Text fontSize="xl" color="red" mr={2}>-1.30 (-5.61%)</Text>
                <Text fontSize="md" color={isDark ? 'gray.400' : 'gray.500'}>24 年 9 月 25 日下午 4:00</Text>
            </Box>
            <Text fontSize="md" color={isDark ? 'gray.400' : 'gray.500'} mb={6}>纽交所 | 美元 | 盘后交易：21.93美元 <Text as="span" color="green">+0.04 (+0.18%)</Text> 下午7:59</Text>
            <Box display="flex" mt={4} borderBottom="1px" borderColor={isDark ? 'gray.700' : 'gray.200'}>
                {['概括','持仓', '评级', '财务', '收益', '股息','估值', '生长', '盈利能力', '势头', '同行', '选项', '制图'].map((item, index) => (
                    <Text
                        key={index}
                        fontSize="md"
                        p={2}
                        cursor="pointer"
                        _hover={{ color: isDark ? 'gray.100' : 'black' }}
                        color={selectedOption === item ? (isDark ? 'gray.100' : 'black') : (isDark ? 'gray.400' : 'gray.500')}
                        fontWeight={selectedOption === item ? 'bold' : 'normal'}
                        mx={2}
                        onClick={() => handleOptionClick(item)}
                    >
                        {item}
                    </Text>
                ))}
            </Box>
            {selectedOption && subOptions[selectedOption as keyof typeof subOptions] && (
                <Box mt={4} display="flex" alignItems="center">
                    {subOptions[selectedOption as keyof typeof subOptions].map((item, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <Text fontSize="sm" color={isDark ? 'gray.500' : 'gray.700'} mx={2}>|</Text>}
                            <Text
                                fontSize="sm"
                                p={2}
                                cursor="pointer"
                                _hover={{ color: isDark ? 'gray.100' : 'black' }}
                                color={subOption === item ? (isDark ? 'gray.100' : 'black') : (isDark ? 'gray.400' : 'gray.500')}
                                onClick={() => handleSubOptionClick(item)}
                            >
                                {item}
                            </Text>
                        </React.Fragment>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default OptionsControl;