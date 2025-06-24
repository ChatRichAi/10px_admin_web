'use client';
import { useState, useEffect } from "react";
import Icon from "@/components/Icon";
// import Asset from "./Asset";
// import Transaction from "./Transaction";
import useRealTimePrices from "@/components/useSearchData";
import axios from "axios";
import { useColorMode } from "@chakra-ui/react";
import { useSymbolContext } from '@/components/contexts/SymbolContext';
import { useRouter } from 'next/navigation';

import { trendingAssets, recentTransactions } from "@/mocks/search";

// 安全 JSON 解析工具函数，防止 undefined 或非法 JSON 报错
function safeJsonParse(str: string | null | undefined, defaultValue: any = null) {
    try {
        if (!str || str === "undefined" || str === undefined) return defaultValue;
        return JSON.parse(str);
    } catch {
        return defaultValue;
    }
}

type SearchProps = {};

const Search = ({ }: SearchProps) => {
    const [search, setSearch] = useState("");
    const [symbols, setSymbols] = useState<string[]>([]);
    const { prices, percentChanges } = useRealTimePrices(symbols);
    const FMP_API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
    const { colorMode } = useColorMode();
    const isDarkMode = colorMode === "dark";

    // 美股相关
    const [usStocks, setUSStocks] = useState<any[]>([]); // 搜索结果
    const [usQuotes, setUSQuotes] = useState<any[]>([]); // 行情
    const usDefaultSymbols = ["QQQ", "SPY", "DIA"];
    const [usMainStocks, setUsMainStocks] = useState<any[]>([]); // 三大指数行情
    const [usStocksWithQuote, setUsStocksWithQuote] = useState<any[]>([]);

    const [searchType, setSearchType] = useState<'crypto' | 'us'>('crypto');

    const [cryptoIconLoaded, setCryptoIconLoaded] = useState<{ [symbol: string]: boolean }>({});
    const [usIconLoaded, setUsIconLoaded] = useState<{ [symbol: string]: boolean }>({});

    const { setSymbol } = useSymbolContext();
    const router = useRouter();

    // 获取三大指数行情
    useEffect(() => {
        async function fetchMainUSStocks() {
            const url = `https://financialmodelingprep.com/api/v3/quote/${usDefaultSymbols.join(",")}?apikey=${FMP_API_KEY}`;
            try {
                const res = await axios.get(url);
                setUsMainStocks(res.data);
            } catch (e) {
                setUsMainStocks([]);
            }
        }
        fetchMainUSStocks();
    }, [FMP_API_KEY]);

    // 搜索美股标的+批量获取行情（同步修复）
    useEffect(() => {
        if (!search) {
            setUSStocks([]);
            setUSQuotes([]);
            setUsStocksWithQuote([]);
            return;
        }
        let active = true;
        async function fetchUSStocksAndQuotes() {
            try {
                // 1. 搜索美股标的
                const url = `https://financialmodelingprep.com/stable/search-symbol?query=${encodeURIComponent(search)}&apikey=${FMP_API_KEY}`;
                const res = await axios.get(url);
                const stocks = res.data.filter((item: any) => item.symbol);
                setUSStocks(stocks);
                // 2. 批量获取行情
                if (stocks.length > 0) {
                    const symbols = stocks.map((item: any) => item.symbol).slice(0, 12); // 取前12个，后面再slice 6
                    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${symbols.join(",")}?apikey=${FMP_API_KEY}`;
                    const quoteRes = await axios.get(quoteUrl);
                    setUSQuotes(quoteRes.data);
                    // 3. 合并行情和标的，保证一一对应
                    if (active) {
                        const stocksWithQuote = stocks.map((item: any) => {
                            const symbol = item.symbol.toUpperCase();
                            const quote = quoteRes.data.find((q: any) => q.symbol.toUpperCase() === symbol);
                            return { ...item, quote };
                        });
                        setUsStocksWithQuote(stocksWithQuote);
                    }
                } else {
                    setUSQuotes([]);
                    setUsStocksWithQuote([]);
                }
            } catch (e) {
                setUSStocks([]);
                setUSQuotes([]);
                setUsStocksWithQuote([]);
            }
        }
        fetchUSStocksAndQuotes();
        return () => { active = false; };
    }, [search, FMP_API_KEY]);

    useEffect(() => {
        const cachedSymbols = localStorage.getItem('symbols');
        if (cachedSymbols && cachedSymbols !== 'undefined') {
            setSymbols(safeJsonParse(cachedSymbols, []));
        } else {
            axios.get('https://api.binance.com/api/v3/ticker/24hr')
                .then(response => {
                    const sortedPairs = response.data
                        .sort((a: { quoteVolume: number }, b: { quoteVolume: number }) => b.quoteVolume - a.quoteVolume)
                        .slice(0, 100)
                        .map((item: { symbol: string }) => item.symbol);
                    setSymbols(sortedPairs);
                    localStorage.setItem('symbols', JSON.stringify(sortedPairs));
                })
                .catch(error => {
                    console.error("Error fetching trading pairs:", error);
                });
        }
    }, []);

    const cryptoIcons = {
        BTC: "/images/crypto-icon-1.png",
        ETH: "/images/crypto-icon-2.png",
        SOL: "/images/crypto-icon-3.png",
        DEFAULT: "/images/crypto-icon-1.png"
    };

    const defaultSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
    const filteredSymbols = search ? symbols.filter(symbol =>
        symbol.toLowerCase().includes(search.toLowerCase())
    ) : defaultSymbols;

    // 限制只显示最接近的6个结果
    const filteredSymbolsLimited = filteredSymbols.slice(0, 6);
    const usStocksWithQuoteLimited = usStocksWithQuote
        .filter(item => /^[A-Z]+$/.test(item.symbol))
        .slice(0, 6);

    // Skeleton 占位组件
    function SkeletonRow() {
        return (
            <div className="flex justify-between items-center px-8 py-3">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-theme-on-surface-2 animate-pulse mr-2" />
                    <div className="w-16 h-4 bg-gray-200 dark:bg-theme-on-surface-2 rounded animate-pulse" />
                </div>
                <div className="w-12 h-4 bg-gray-200 dark:bg-theme-on-surface-2 rounded animate-pulse" />
                <div className="w-10 h-4 bg-gray-200 dark:bg-theme-on-surface-2 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center w-full mb-4 h-16">
                <div className="relative flex-1 h-full flex items-center">
                <input
                        className="w-full h-12 pl-22 pr-8 bg-transparent text-title-1m text-theme-primary outline-none placeholder:text-theme-tertiary md:h-12 md:pl-16 md:text-[1rem]"
                    type="text"
                    placeholder="搜索标的、交易"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    required
                    data-autofocus
                />
                <div className="absolute top-1/2 left-8 flex justify-center items-center w-9 h-9 -translate-y-1/2 md:left-5">
                    <Icon className="fill-theme-tertiary" name="search" />
                    </div>
                </div>
                {/* 美观滑动切换按钮（Segmented Control） */}
                <div className="relative flex ml-4 w-32 rounded-full bg-theme-on-surface-2 p-1 mr-4 h-12 items-center">
                    {/* 滑块高亮 */}
                    <div
                        className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/2 rounded-full transition-all duration-300 z-0`}
                        style={{
                            background: isDarkMode ? '#2a323f' : '#0c68e9',
                            transform: searchType === 'us' ? 'translateX(100%)' : 'translateX(0%)',
                        }}
                    />
                    <button
                        className={`relative z-10 flex-1 h-full rounded-full transition-all duration-200 text-sm font-bold ${searchType === 'crypto' ? 'text-white' : 'text-theme-secondary'}`}
                        onClick={() => setSearchType('crypto')}
                    >
                        加密
                    </button>
                    <button
                        className={`relative z-10 flex-1 h-full rounded-full transition-all duration-200 text-sm font-bold ${searchType === 'us' ? 'text-white' : 'text-theme-secondary'}`}
                        onClick={() => setSearchType('us')}
                    >
                        美股
                    </button>
                </div>
            </div>
            <div className="pt-3 pb-6 border-t border-theme-stroke">
                {searchType === 'crypto' && (
                <div className="mb-3">
                    <div className="px-8 py-3 text-caption-1 text-theme-secondary md:px-4">
                        加密标的
                    </div>
                    <div className="px-4 md:px-2">
                            {filteredSymbolsLimited.length === 0 && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
                            {filteredSymbolsLimited.length > 0 && filteredSymbolsLimited.map((symbol) => {
                            const baseSymbol = symbol.split('USDT')[0] as keyof typeof cryptoIcons;
                            const iconSrc = cryptoIcons[baseSymbol] || cryptoIcons.DEFAULT;
                            return (
                                <div className={`flex justify-between items-center px-8 py-3 text-caption-1 text-theme-secondary md:px-4 hover:bg-gray-200 dark:hover:bg-[#23272f] cursor-pointer`} key={symbol} onClick={() => { setSymbol(symbol); router.push('/handicap'); }}>
                                    <div className="flex items-center">
                                            <div className="w-6 h-6 mr-2 relative">
                                                {!cryptoIconLoaded[symbol] && <div className="absolute inset-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-theme-on-surface-2 animate-pulse" />}
                                                <img
                                                    src={iconSrc}
                                                    alt={symbol}
                                                    className="w-6 h-6"
                                                    style={{ display: cryptoIconLoaded[symbol] ? 'block' : 'none' }}
                                                    onLoad={() => setCryptoIconLoaded(l => ({ ...l, [symbol]: true }))}
                                                    onError={() => setCryptoIconLoaded(l => ({ ...l, [symbol]: false }))}
                                                />
                                            </div>
                                        <div className="font-bold text-black dark:text-white text-lg">{symbol}</div>
                                    </div>
                                        <div className="text-lg text-black dark:text-white">{prices[symbol] !== undefined ? `$${prices[symbol]}` : <div className="w-12 h-4 bg-gray-200 dark:bg-theme-on-surface-2 rounded animate-pulse" />}</div>
                                        <div className={`flex items-center text-lg ${percentChanges[symbol] !== undefined ? (percentChanges[symbol] >= 0 ? "text-green-500" : "text-red-500") : 'text-black dark:text-white'}`}>
                                            {percentChanges[symbol] !== undefined ? (
                                                percentChanges[symbol] >= 0 ? (
                                            <>
                                                <div className="text-green-500">{percentChanges[symbol]}%</div>
                                                <div className="ml-1 text-green-500">▲</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-red-500">{percentChanges[symbol]}%</div>
                                                <div className="ml-1 text-red-500">▼</div>
                                            </>
                                                )
                                            ) : <div className="w-10 h-4 bg-gray-200 dark:bg-theme-on-surface-2 rounded animate-pulse" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                )}
                {searchType === 'us' && (
                    <div className="mb-3">
                        <div className="px-8 py-3 text-caption-1 text-theme-secondary md:px-4">
                            美股标的
                        </div>
                        <div className="px-4 md:px-2">
                            {search ? (
                                usStocksWithQuoteLimited.length === 0 ? (
                                    Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : (
                                    usStocksWithQuoteLimited.map((item: any) => {
                                        const symbol = item.symbol.toUpperCase();
                                        const quote = item.quote;
                                        return (
                                            <div className={`flex justify-between items-center px-8 py-3 text-caption-1 text-theme-secondary md:px-4 hover:bg-gray-200 dark:hover:bg-[#23272f] cursor-pointer`} key={symbol} onClick={() => { setSymbol(symbol); router.push('/handicap'); }}>
                                                <div className="flex items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isDarkMode ? 'bg-theme-on-surface-2' : 'bg-gray-100'} relative`}>
                                                        {!usIconLoaded[symbol] && <div className="absolute w-6 h-6 rounded-full bg-gray-200 dark:bg-theme-on-surface-2 animate-pulse" />}
                                                        <img
                                                            src={`https://financialmodelingprep.com/image-stock/${symbol}.png`}
                                                            alt={symbol}
                                                            className="w-6 h-6"
                                                            style={{ display: usIconLoaded[symbol] ? 'block' : 'none' }}
                                                            onLoad={() => setUsIconLoaded(l => ({ ...l, [symbol]: true }))}
                                                            onError={() => setUsIconLoaded(l => ({ ...l, [symbol]: false }))}
                                                        />
                                                    </div>
                                                    <div className="font-bold text-black dark:text-white text-lg">{symbol}</div>
                                                </div>
                                                <div className="text-lg text-black dark:text-white">{quote ? `$${quote.price}` : <div className="w-12 h-4 bg-gray-200 dark:bg-theme-on-surface-2 rounded animate-pulse" />}</div>
                                                <div className={`flex items-center text-lg ${quote && quote.changesPercentage >= 0 ? "text-green-500" : quote && quote.changesPercentage < 0 ? "text-red-500" : 'text-black dark:text-white'}`}>
                                                    {quote ? (
                                                        quote.changesPercentage >= 0 ? (
                                                            <>
                                                                <div className="text-green-500">{quote.changesPercentage?.toFixed(2)}%</div>
                                                                <div className="ml-1 text-green-500">▲</div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="text-red-500">{quote.changesPercentage?.toFixed(2)}%</div>
                                                                <div className="ml-1 text-red-500">▼</div>
                                                            </>
                                                        )
                                                    ) : <div className="w-10 h-4 bg-gray-200 dark:bg-theme-on-surface-2 rounded animate-pulse" />}
                                                </div>
                                            </div>
                                        );
                                    })
                                )
                            ) : (
                                usMainStocks.length === 0 ? (
                                    Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : (
                                    usMainStocks.map((item: any) => (
                                        <div className={`flex justify-between items-center px-8 py-3 text-caption-1 text-theme-secondary md:px-4 hover:bg-gray-200 dark:hover:bg-[#23272f] cursor-pointer`} key={item.symbol} onClick={() => { setSymbol(item.symbol); router.push('/handicap'); }}>
                                            <div className="flex items-center">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isDarkMode ? 'bg-theme-on-surface-2' : 'bg-gray-100'}`}>
                                                    <img
                                                        src={`https://financialmodelingprep.com/image-stock/${item.symbol}.png`}
                                                        alt={item.symbol}
                                                        className="w-6 h-6"
                                                        onError={e => (e.currentTarget.style.display='none')}
                                                    />
                                                </div>
                                                <div className="font-bold text-black dark:text-white text-lg">{item.symbol}</div>
                                            </div>
                                            <div className="text-lg text-black dark:text-white">${item.price}</div>
                                            <div className={`flex items-center text-lg ${item.changesPercentage >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                {item.changesPercentage >= 0 ? (
                                                    <>
                                                        <div className="text-green-500">{item.changesPercentage?.toFixed(2)}%</div>
                                                        <div className="ml-1 text-green-500">▲</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-red-500">{item.changesPercentage?.toFixed(2)}%</div>
                                                        <div className="ml-1 text-red-500">▼</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center px-8 py-4 space-x-6 bg-theme-n-8 md:p-4">
                <div className="mr-auto text-caption-1 text-theme-secondary">
                    显示 1000 个结果中的 10 个
                </div>
                <div className="flex items-center md:hidden">
                    <div className="mr-3 text-caption-1 text-theme-secondary">
                        滚动的
                    </div>
                    <div className="flex space-x-1">
                        <div className="flex justify-center items-center w-8 h-7 rounded-lg bg-theme-surface-pure border border-theme-stroke text-0">
                            <Icon
                                className="!w-4 !h-4 fill-theme-primary"
                                name="arrow-bottom"
                            />
                        </div>
                        <div className="flex justify-center items-center w-8 h-7 rounded-lg bg-theme-surface-pure border border-theme-stroke text-0">
                            <Icon
                                className="!w-4 !h-4 fill-theme-primary"
                                name="arrow-top"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center md:hidden">
                    <div className="mr-3 text-caption-1 text-theme-secondary">
                        确认
                    </div>
                    <div className="flex justify-center items-center w-10 h-7 rounded-lg bg-theme-surface-pure border border-theme-stroke text-0">
                        <Icon
                            className="fill-theme-primary"
                            name="arrow-select"
                        />
                    </div>
                </div>
                <div className="flex items-center md:hidden">
                    <div className="mr-3 text-caption-1 text-theme-secondary">
                        关闭
                    </div>
                    <button className="group w-10 h-7 pt-0.5 rounded-lg bg-theme-surface-pure border border-theme-stroke text-caption-2">
                        ESC
                    </button>
                </div>
            </div>
        </>
    );
};

export default Search;