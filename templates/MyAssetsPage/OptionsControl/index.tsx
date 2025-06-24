import React from 'react';
import { Box, Select, Input, IconButton } from '@chakra-ui/react';
import { CalendarIcon, SettingsIcon } from '@chakra-ui/icons';

const OptionsControl = () => {
    return (
        <Box display="flex" alignItems="center" p={4} bg="white" rounded="lg" shadow="sm" gap={4}>
            <Box position="relative" width="200px" flex="1">
                <Select placeholder="Apis" width="100%" appearance="none" pr="2.5rem">
                    <option value="option1">Binance</option>
                    <option value="option2">OKEX</option>
                    <option value="option3">Bybit</option>
                </Select>
                <Box position="absolute" top="50%" right="1rem" transform="translateY(-50%)">
                    <CalendarIcon color="gray.500" />
                </Box>
            </Box>
            <Box position="relative" width="200px" flex="1">
                <Select placeholder="币种" width="100%" appearance="none" pr="2.5rem">
                    <option value="option1">BTC</option>
                    <option value="option2">ETH</option>
                    <option value="option3">BNB</option>
                </Select>
                <Box position="absolute" top="50%" right="1rem" transform="translateY(-50%)">
                    <CalendarIcon color="gray.500" />
                </Box>
            </Box>
            <Box width="200px" flex="1">
                <Input type="datetime-local" width="100%" />
            </Box>
            <Box width="200px" flex="1">
                <Input type="datetime-local" width="100%" />
            </Box>
            <Box flex="0">
                <IconButton
                    aria-label="Settings"
                    icon={<SettingsIcon />}
                    variant="outline"
                    colorScheme="gray"
                />
            </Box>
        </Box>
    );
};

export default OptionsControl;