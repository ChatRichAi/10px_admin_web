#!/usr/bin/env python3
"""
简化的PandaFactor服务启动脚本
"""
import sys
import os
from pathlib import Path

# 添加panda_factor到Python路径
panda_factor_path = Path(__file__).parent / "panda_factor"
sys.path.insert(0, str(panda_factor_path))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 创建FastAPI应用
app = FastAPI(
    title="PandaFactor API",
    description="PandaFactor量化因子分析服务",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "PandaFactor API服务运行中",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "message": "PandaFactor服务正常运行"
    }

@app.get("/api/factors")
async def get_factors():
    """获取因子列表"""
    return {
        "status": "success",
        "data": {
            "factors": [
                {
                    "id": "rsi_14",
                    "name": "RSI_14",
                    "description": "14日相对强弱指数，用于判断超买超卖状态",
                    "category": "技术指标",
                    "status": "active"
                },
                {
                    "id": "macd_12_26_9",
                    "name": "MACD_12_26_9", 
                    "description": "MACD指标，用于判断趋势变化",
                    "category": "技术指标",
                    "status": "active"
                }
            ],
            "total": 2
        }
    }

@app.get("/api/calculate/technical_indicators")
async def calculate_technical_indicators(symbol: str = "BTC"):
    """计算技术指标"""
    return {
        "status": "success",
        "data": [
            {
                "name": "RSI_14",
                "value": 65.5,
                "signal": "neutral",
                "description": "14日相对强弱指数"
            },
            {
                "name": "MACD",
                "value": 0.25,
                "signal": "bullish", 
                "description": "MACD指标"
            }
        ]
    }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="启动PandaFactor服务")
    parser.add_argument("--host", default="0.0.0.0", help="主机地址")
    parser.add_argument("--port", type=int, default=8001, help="端口号")
    args = parser.parse_args()
    
    print(f"🚀 启动PandaFactor服务...")
    print(f"📍 地址: http://{args.host}:{args.port}")
    print(f"📚 API文档: http://{args.host}:{args.port}/docs")
    
    uvicorn.run(app, host=args.host, port=args.port)

