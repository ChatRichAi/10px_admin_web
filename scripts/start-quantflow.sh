#!/bin/bash

# 启动PandaAI QuantFlow服务脚本

echo "🚀 启动PandaAI QuantFlow服务..."

# 检查panda_quantflow目录是否存在
if [ ! -d "panda_quantflow" ]; then
    echo "❌ 错误: panda_quantflow目录不存在"
    echo "请确保panda_quantflow项目已正确放置在项目根目录下"
    exit 1
fi

# 进入panda_quantflow目录
cd panda_quantflow

# 检查Python环境
if ! command -v python &> /dev/null; then
    echo "❌ 错误: Python未安装或不在PATH中"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "📦 创建虚拟环境..."
    python -m venv venv
fi

# 激活虚拟环境
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# 安装依赖
echo "📦 安装依赖包..."
pip install -e .

# 检查MongoDB是否运行
echo "🔍 检查MongoDB服务..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  警告: MongoDB服务未运行"
    echo "请确保MongoDB已启动，或者使用PandaAI提供的数据库"
fi

# 启动服务
echo "🎯 启动QuantFlow服务..."
echo "服务将在 http://127.0.0.1:8000 启动"
echo "工作流UI: http://127.0.0.1:8000/quantflow/"
echo "图表UI: http://127.0.0.1:8000/charts/"
echo ""
echo "按 Ctrl+C 停止服务"

python src/panda_server/main.py
