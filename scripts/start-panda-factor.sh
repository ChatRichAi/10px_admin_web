#!/bin/bash

# PandaFactor 启动脚本
# 用于启动 PandaFactor 因子库服务

echo "🚀 启动 PandaFactor 因子库服务..."

# 检查panda_factor目录是否存在
if [ ! -d "panda_factor" ]; then
    echo "❌ 错误: panda_factor目录不存在"
    echo "请确保panda_factor项目已正确放置在项目根目录下"
    exit 1
fi

# 进入panda_factor目录
cd panda_factor

# 检查Python环境
if ! command -v python &> /dev/null; then
    echo "❌ 错误: Python未安装或不在PATH中"
    exit 1
fi

# 检查依赖是否已安装
echo "📦 检查依赖..."
if ! python -c "import panda_factor" 2>/dev/null; then
    echo "⚠️  警告: panda_factor模块未安装，尝试安装..."
    pip install -e .
fi

# 检查MongoDB连接
echo "🔍 检查MongoDB连接..."
if ! python -c "from pymongo import MongoClient; MongoClient('mongodb://localhost:27017/').admin.command('ping')" 2>/dev/null; then
    echo "⚠️  警告: MongoDB连接失败，请确保MongoDB服务正在运行"
    echo "启动命令: brew services start mongodb-community"
fi

# 启动panda_factor_server
echo "🎯 启动PandaFactor服务器..."
cd panda_factor_server

# 检查端口是否被占用
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  警告: 端口8000已被占用，尝试终止现有进程..."
    pkill -f "panda_factor_server"
    sleep 2
fi

# 启动服务
echo "🚀 启动PandaFactor服务在端口8000..."
python __main__.py &

# 等待服务启动
sleep 3

# 检查服务是否成功启动
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ PandaFactor服务启动成功！"
    echo "📊 服务地址: http://localhost:8000"
    echo "📚 API文档: http://localhost:8000/docs"
    echo "🔧 管理界面: http://localhost:8000"
    echo ""
    echo "按 Ctrl+C 停止服务"
    
    # 保持脚本运行
    wait
else
    echo "❌ PandaFactor服务启动失败"
    echo "请检查日志文件: panda_factor_server/logs/"
    exit 1
fi
