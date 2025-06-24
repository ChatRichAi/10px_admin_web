import React from 'react';
import './TradeStats.css'; // 引入CSS文件
import { FaChartPie, FaTrophy, FaClock, FaChartBar } from 'react-icons/fa'; // 从 react-icons 导入图标

const iconColor = "#B5E4CA"; // 定义图标颜色

interface TradeStatsProps {
  totalTrades: number;
  winRate: number;
  wins: number;
  losses: number;
  avgTradeDuration: string;
  longPercentage: number;
  longCount: number;
  shortPercentage: number;
  shortCount: number;
}

const TradeStats: React.FC<TradeStatsProps> = ({
  totalTrades,
  winRate,
  wins,
  losses,
  avgTradeDuration,
  longPercentage,
  longCount,
  shortPercentage,
  shortCount
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex justify-between items-center space-x-6">
      <div className="stat-item flex-1">
        <div className="icon"><FaChartPie style={{ color: iconColor }} /></div>
        <div className="text">
          <div className="label">总交易次数</div>
          <div className="value">{totalTrades}</div>
        </div>
      </div>
      <div className="stat-item flex-1">
        <div className="icon"><FaTrophy style={{ color: iconColor }} /></div>
        <div className="text">
          <div className="label">胜率</div>
          <div className="value">{winRate.toFixed(2)}%</div>
          <div className="details">
            <span className="text-green-500">{wins} 盈</span> / <span className="text-red-500">{losses} 亏</span>
          </div>
        </div>
      </div>
      <div className="stat-item flex-1">
        <div className="icon"><FaClock style={{ color: iconColor }} /></div>
        <div className="text">
          <div className="label">平均交易时长</div>
          <div className="value">{avgTradeDuration}</div>
        </div>
      </div>
      <div className="stat-item flex-1">
        <div className="icon"><FaChartBar style={{ color: iconColor }} /></div>
        <div className="text">
          <div className="label">多单占比</div>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: `${longPercentage}%` }}></div>
          </div>
          <div className="details">
            <span className="text-green-500">{longPercentage.toFixed(2)}% ({longCount})</span> / <span className="text-red-500">{shortPercentage.toFixed(2)}% ({shortCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeStats;