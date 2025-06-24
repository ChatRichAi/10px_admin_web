import React, { useState, useEffect, memo } from 'react';
import { Container, TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Grid, Chip, ToggleButton, ToggleButtonGroup, Fab, Box, Skeleton, LinearProgress } from '@mui/material';
import RobotIcon from '@mui/icons-material/SmartToy';
import useTradeData from '@/components/useTradeData';
import { useColorMode } from "@chakra-ui/react";

// 定义 TradeRow 组件的 props 类型
interface TradeRowProps {
    trade: {
        timestamp: number;
        symbol: string;
        price: number;
        quantity: number;
        order_type: string;
    };
    marketType: string;
    index: number;
}

const TradeRow: React.FC<TradeRowProps> = memo(({ trade, marketType, index }) => {
    const { colorMode } = useColorMode();
    const isDarkMode = colorMode === "dark";

    const cellStyle = { color: isDarkMode ? '#E2E8F0' : '#000000', textAlign: 'left' as const, padding: '8px' };

    return (
        <TableRow>
            <TableCell style={cellStyle}>{new Date(trade.timestamp).toLocaleString('zh-CN', { timeZone: 'UTC', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</TableCell>
            <TableCell style={cellStyle}>{trade.symbol}</TableCell>
            <TableCell style={cellStyle}>{trade.price}</TableCell>
            <TableCell style={cellStyle}>
                {trade.quantity > 10 && (
                    <span style={{ color: 'green' }}>●</span>
                )}
                {trade.quantity}
            </TableCell>
            <TableCell style={cellStyle}>
                <Chip
                    label={trade.order_type === 'B' ? <strong>Buy-{index + 1}</strong> : <strong>Sell-{index + 1}</strong>}
                    style={{
                        backgroundColor: trade.order_type === 'B' ? '#32AE60' : '#0C68E9',
                        color: isDarkMode ? '#000000' : 'white',
                        textAlign: 'center',
                    }}
                />
            </TableCell>
            <TableCell style={cellStyle}>{marketType === 'spot' ? '现货' : '合约'}</TableCell>
        </TableRow>
    );
});

interface TradeDataFormProps {
    symbol?: string;
}

const TradeDataForm = (props: TradeDataFormProps) => {
    const {
        trades,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        symbol: contextSymbol,
        setSymbol,
        marketType,
        setMarketType,
        isRealTime,
        setIsRealTime,
        fetchTrades,
        exportTrades,
        dataType,
        setDataType
    } = useTradeData();

    // 如果props.symbol有值，优先用props.symbol
    const symbol = props.symbol || contextSymbol;

    const { colorMode } = useColorMode();
    const isDarkMode = colorMode === "dark";

    const [exportLoading, setExportLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [realTimeLoading, setRealTimeLoading] = useState(false);

    useEffect(() => {
        if (isRealTime) {
            setRealTimeLoading(true);
            const timer = setTimeout(() => {
                setRealTimeLoading(false);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isRealTime]);

    const handleClickOpen = () => {
        setOpen(true);
        console.log('Dialog Opened:', true);
    };

    const handleExportTrades = async () => {
        setExportLoading(true);
        await new Promise(resolve => setTimeout(resolve, 5000));
        await exportTrades();
        setExportLoading(false);
    };

    const handleFetchTrades = async () => {
        setFetchLoading(true);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await fetchTrades(false, dataType);
        setFetchLoading(false);
    };

    const handleRealTimeToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsRealTime(event.target.checked);
    };

    const buyTrades = trades.filter(trade => trade.order_type === 'B');
    const sellTrades = trades.filter(trade => trade.order_type === 'S');

    const renderSkeletonForm = () => (
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
                <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <Skeleton variant="rectangular" height={40} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <Skeleton variant="rectangular" height={36} />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
                <Skeleton variant="rectangular" height={36} />
            </Grid>
        </Grid>
    );

    const tableHeaderStyle = {
        backgroundColor: isDarkMode ? '#2D3748' : '#F7FAFC',
        fontWeight: 'bold',
        color: isDarkMode ? '#E2E8F0' : '#4A5568',
        borderBottom: `2px solid ${isDarkMode ? '#4A5568' : '#E2E8F0'}`,
        padding: '16px',
        fontSize: '0.875rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
    };

    return (
        <Container>
            {(fetchLoading || realTimeLoading) ? renderSkeletonForm() : (
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth margin="normal">
                            <TextField
                                label="开始时间"
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                    style: { color: isDarkMode ? '#E2E8F0' : '#000000' } // 根据暗夜模式调整颜色
                                }}
                                InputProps={{
                                    style: { color: isDarkMode ? '#E2E8F0' : '#000000', backgroundColor: isDarkMode ? '#1A202C' : '#FFFFFF' } // 根据暗夜模式调整颜色
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth margin="normal">
                            <TextField
                                label="结束时间"
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                    style: { color: isDarkMode ? '#E2E8F0' : '#000000' } // 根据暗夜模式调整颜色
                                }}
                                InputProps={{
                                    style: { color: isDarkMode ? '#E2E8F0' : '#000000', backgroundColor: isDarkMode ? '#1A202C' : '#FFFFFF' } // 根据暗夜模式调整颜色
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel shrink={symbol !== ''} style={{ color: isDarkMode ? '#E2E8F0' : '#000000' }}>交易对</InputLabel>
                            <Select
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                label="交易对"
                                displayEmpty
                                style={{ color: isDarkMode ? '#E2E8F0' : '#000000', backgroundColor: isDarkMode ? '#1A202C' : '#FFFFFF' }} // 根据暗夜模式调整颜色
                            >
                                <MenuItem value="btcusdt">BTCUSDT</MenuItem>
                                <MenuItem value="btcusdt_perp">BTCUSDT_PERP</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel shrink={marketType !== ''} style={{ color: isDarkMode ? '#E2E8F0' : '#000000' }}>市场类型</InputLabel>
                            <Select
                                value={marketType}
                                onChange={(e) => setMarketType(e.target.value)}
                                label="市场类型"
                                displayEmpty
                                style={{ color: isDarkMode ? '#E2E8F0' : '#000000', backgroundColor: isDarkMode ? '#1A202C' : '#FFFFFF' }} // 根据暗夜模式调整颜色
                            >
                                <MenuItem value="spot">现货</MenuItem>
                                <MenuItem value="perp">合约</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <ToggleButtonGroup
                            value={dataType}
                            exclusive
                            onChange={(e, newDataType) => {
                                if (newDataType !== null) {
                                    setDataType(newDataType);
                                }
                            }}
                            aria-label="data type"
                            style={{ color: isDarkMode ? '#E2E8F0' : '#000000' }} // 根据暗夜模式调整颜色
                        >
                            <ToggleButton value="orderbook" aria-label="order book" style={{ color: isDarkMode ? '#E2E8F0' : '#000000' }}>
                                订单簿
                            </ToggleButton>
                            <ToggleButton value="trades" aria-label="trades" style={{ color: isDarkMode ? '#E2E8F0' : '#000000' }}>
                                实时成交
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            className="btn-secondary flex-1 px-2"
                            onClick={handleFetchTrades}
                            disabled={fetchLoading}
                            fullWidth
                        >
                            {fetchLoading ? <CircularProgress size={24} /> : '获取数据'}
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            className="btn-gray flex-1 px-2"
                            onClick={handleExportTrades}
                            disabled={exportLoading}
                            fullWidth
                        >
                            {exportLoading ? <CircularProgress size={24} /> : '导出数据'}
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            className="btn-gray flex-1 px-2"
                            onClick={() => console.log('策略合成')}
                            fullWidth
                        >
                            策略合成
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Button
                            className="btn-gray flex-1 px-2"
                            onClick={() => console.log('盘口报表')}
                            fullWidth
                        >
                            盘口报表
                        </Button>
                    </Grid>
                </Grid>
            )}
            <Grid item xs={12}>
                {realTimeLoading && (
                    <Box display="flex" alignItems="center">
                        <Box width="100%" mr={1}>
                            <LinearProgress />
                        </Box>
                        <Box minWidth={35}>
                            <Typography variant="body2" color="textSecondary">加载中...</Typography>
                        </Box>
                    </Box>
                )}
            </Grid>
            <Grid container spacing={2} style={{ marginTop: '20px' }}>
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper} style={{ marginTop: '10px', backgroundColor: isDarkMode ? '#1A202C' : '#FFFFFF', borderRadius: '8px', overflow: 'hidden' }}>
                        <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>时间</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>标的</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>价格</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>数量</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>多空</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>类型</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(fetchLoading || realTimeLoading) ? (
                                    Array.from(new Array(20)).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" width={60} height={30} /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    buyTrades.map((trade, index) => (
                                        <TradeRow key={index} trade={trade} marketType={marketType} index={index} />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TableContainer component={Paper} style={{ marginTop: '10px', backgroundColor: isDarkMode ? '#1A202C' : '#FFFFFF', borderRadius: '8px', overflow: 'hidden' }}>
                        <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>时间</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>标的</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>价格</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>数量</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>多空</TableCell>
                                    <TableCell style={{ ...tableHeaderStyle, textAlign: 'left' as const, padding: '8px' }}>类型</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(fetchLoading || realTimeLoading) ? (
                                    Array.from(new Array(20)).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" width={60} height={30} /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    sellTrades.map((trade, index) => (
                                        <TradeRow key={index} trade={trade} marketType={marketType} index={index} />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
            <Fab
                color="primary"
                aria-label="add"
                onClick={handleClickOpen}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000
                }}
            >
                <RobotIcon />
            </Fab>
        </Container>
    );
};

export default TradeDataForm;