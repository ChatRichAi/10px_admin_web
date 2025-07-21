import { useState, useEffect } from "react";

const useRealTimePrices = (symbols: string[]) => {
    const [prices, setPrices] = useState<{ [key: string]: number }>({});
    const [percentChanges, setPercentChanges] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const newPrices: { [key: string]: number } = {};
                const newPercentChanges: { [key: string]: number } = {};

                // 批量获取所有币对行情
                const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
                const allData = await response.json();
                // 本地过滤关心的symbols
                for (const symbol of symbols) {
                    const data = allData.find((item: any) => item.symbol === symbol);
                    if (data) {
                    newPrices[symbol] = Math.round(parseFloat(data.lastPrice));
                    newPercentChanges[symbol] = parseFloat(parseFloat(data.priceChangePercent).toFixed(2));
                    }
                }

                setPrices(newPrices);
                setPercentChanges(newPercentChanges);
            } catch (error) {
                console.error("Error fetching data from Binance API", error);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 6000); 
        return () => clearInterval(intervalId);
    }, [symbols]);

    return { prices, percentChanges };
};

// 获取加密币icon，优先本地写死，其次CoinGecko
const localIcons: Record<string, string> = {
  BTC: '/images/crypto-icon-1.png',
  ETH: '/images/crypto-icon-2.png',
  SOL: '/images/crypto-icon-3.png',
  // 可继续扩展
};
const iconCache: Record<string, string> = {};

export async function getCryptoIcon(symbol: string): Promise<string> {
  const base = symbol.replace(/USDT$/, '');
  if (iconCache[base]) return iconCache[base];
  try {
    // CoinGecko主流币id和symbol基本一致，特殊币种可做映射
    const idMap: Record<string, string> = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana' };
    const id = idMap[base] || base.toLowerCase();
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    const iconUrl = data.image?.small || data.image?.thumb || '';
    if (iconUrl) iconCache[base] = iconUrl;
    return iconUrl || localIcons[base] || '/images/crypto-icon-1.png';
  } catch {
    return localIcons[base] || '/images/crypto-icon-1.png';
  }
}

export default useRealTimePrices;