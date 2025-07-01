import React, { useState } from "react";
import Card from "@/components/Card";
import dynamic from "next/dynamic";
import { useVolSurfaceData } from "@/components/useVolSurfaceData";
import 'echarts-gl';

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// 定义数据类型
interface VolSurfaceData {
  xAxis: string[];
  yAxis: string[];
  zData: number[][];
}

// 默认模拟数据
const defaultData: VolSurfaceData = {
  xAxis: ['30JUN25', '23OCT25', '16FEB26', '12JUN26', '05OCT26'],
  yAxis: ['10P', '20P', '30C', '40C'],
  zData: [
    [30, 32, 35, 38],
    [31, 33, 36, 39],
    [33, 35, 38, 41],
    [36, 38, 41, 44],
    [38, 41, 44, 48],
  ],
};

const VolSurface = ({ className }: { className?: string }) => {
  const [symbol, setSymbol] = useState('BTC');
  
  // 使用自定义Hook获取数据
  const { data, loading, error, fetchData, refresh } = useVolSurfaceData(symbol, true, 5 * 60 * 1000);

  // 如果没有数据，显示加载状态
  if (!data) {
    return (
      <Card title="模型波动率平面" className={className}>
        <div className="h-80 flex items-center justify-center">
          <div className="flex items-center gap-2 text-theme-secondary">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            加载中...
          </div>
        </div>
      </Card>
    );
  }

  const customTooltip = (params: any) => {
    if (!params || !params.value) return '';
    const [xIdx, yIdx, z] = params.value;
    const expiry = data.xAxis[xIdx];
    const delta = data.yAxis[yIdx];
    const color = '#3b82f6';
    return `
      <div style="background:rgba(23,23,30,0.25);backdrop-filter:blur(8px);border-radius:16px;box-shadow:0 4px 24px 0 rgba(0,0,0,0.12);padding:16px;min-width:160px;color:#fff;">
        <div style="font-size:16px;font-weight:bold;margin-bottom:8px;">Vol Surface Pointer</div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="display:inline-block;width:12px;height:12px;border-radius:6px;background:${color};"></span>
        </div>
        <div style="font-size:14px;line-height:1.7;">
          - Expiry: <span style='color:#fff;'>${expiry}</span><br/>
          - Delta: <span style='color:#fff;'>${delta}</span><br/>
          - Volatility: <span style='color:#fff;'>${z !== null ? parseFloat(z).toFixed(2) : 'N/A'}%</span>
        </div>
      </div>
    `;
  };

  // 计算波动率范围用于颜色映射（过滤掉null值）
  const validValues = data.zData.flat().filter((val): val is number => val !== null);
  const volMin = validValues.length > 0 ? Math.min(...validValues) : 0;
  const volMax = validValues.length > 0 ? Math.max(...validValues) : 100;

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      extraCssText: 'box-shadow:none;',
      formatter: customTooltip,
    },
    visualMap: {
      show: false,
      min: volMin,
      max: volMax,
      inRange: {
        color: ['#3b82f6', '#fbbf24', '#ef4444'],
      },
    },
    xAxis3D: {
      type: 'category',
      name: '到期日',
      data: data.xAxis,
      nameTextStyle: { color: '#6F767E', fontSize: 12 },
      axisLabel: { color: '#6F767E', fontSize: 12 },
    },
    yAxis3D: {
      type: 'category',
      name: 'Delta',
      data: data.yAxis,
      nameTextStyle: { color: '#6F767E', fontSize: 12 },
      axisLabel: { color: '#6F767E', fontSize: 12 },
    },
    zAxis3D: {
      type: 'value',
      name: '波动率',
      nameTextStyle: { color: '#6F767E', fontSize: 12 },
      axisLabel: { color: '#6F767E', fontSize: 12 },
      min: Math.floor(volMin - 5),
      max: Math.ceil(volMax + 5),
    },
    grid3D: {
      boxWidth: 120,
      boxDepth: 60,
      viewControl: {
        projection: 'perspective',
        autoRotate: false,
      },
      light: {
        main: {
          intensity: 1.2,
          shadow: true,
        },
        ambient: {
          intensity: 0.3,
        },
      },
    },
    series: [
      {
        type: 'surface',
        wireframe: { show: false },
        data: data.zData.map((row, i) => 
          row.map((z, j) => [i, j, z !== null ? z : 0]) // 将null值替换为0用于显示
        ).flat(),
        itemStyle: {
          opacity: 0.95,
        },
      },
    ],
  };

  return (
    <Card title="模型波动率平面" className={className}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value)}
            className="px-2 py-1 rounded text-sm border bg-theme-on-surface-1 text-theme-primary border-theme-stroke"
          >
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
            <option value="SOL">SOL</option>
          </select>
          {loading && (
            <div className="flex items-center gap-1 text-xs text-theme-secondary">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              更新中...
            </div>
          )}
          {data.timestamp && (
            <div className="text-xs text-theme-tertiary">
              更新: {new Date(data.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
        <button 
          onClick={refresh}
          className="p-1 text-theme-secondary hover:text-theme-primary disabled:opacity-50"
          disabled={loading}
          title="刷新数据"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-xs">
          错误: {error}
        </div>
      )}
      
      <div className="h-80">
        <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
      </div>
    </Card>
  );
};

export default VolSurface; 