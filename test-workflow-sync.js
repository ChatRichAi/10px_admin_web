#!/usr/bin/env node

/**
 * 工作流同步测试脚本
 * 测试 QuantFlow 和 Next.js 应用之间的工作流同步功能
 */

const fetch = require('node-fetch');

const QUANTFLOW_BASE = 'http://127.0.0.1:8000';
const NEXTJS_BASE = 'http://localhost:3000';

async function testQuantFlowConnection() {
  console.log('🔍 测试 QuantFlow 连接...');
  try {
    const response = await fetch(`${QUANTFLOW_BASE}/api/workflow/all`, {
      method: 'GET',
      headers: {
        'uid': 'demo-user',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ QuantFlow 连接成功');
      console.log(`📊 工作流数量: ${data.data?.total_count || 0}`);
      return data.data?.workflows || [];
    } else {
      console.log('❌ QuantFlow 连接失败:', response.status);
      return [];
    }
  } catch (error) {
    console.log('❌ QuantFlow 连接异常:', error.message);
    return [];
  }
}

async function testNextJSConnection() {
  console.log('🔍 测试 Next.js 应用连接...');
  try {
    const response = await fetch(`${NEXTJS_BASE}/api/workflow-sync?source=quantflow`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Next.js 应用连接成功');
      console.log(`📊 同步状态: ${data.status}`);
      return data;
    } else {
      console.log('❌ Next.js 应用连接失败:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Next.js 应用连接异常:', error.message);
    return null;
  }
}

async function testWorkflowSync() {
  console.log('🔄 测试工作流同步...');
  try {
    const response = await fetch(`${NEXTJS_BASE}/api/workflow-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync-from-quantflow',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 工作流同步成功');
      console.log(`📊 同步结果: ${data.message}`);
      console.log(`📊 同步数量: ${data.data?.total || 0}`);
      return data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ 工作流同步失败:', response.status, errorData.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 工作流同步异常:', error.message);
    return null;
  }
}

async function createTestWorkflow() {
  console.log('📝 创建测试工作流...');
  try {
    const testWorkflow = {
      name: `测试工作流_${Date.now()}`,
      description: '这是一个测试工作流，用于验证同步功能',
      config: {
        nodes: [
          {
            id: 'node1',
            type: 'data_source',
            name: '数据源',
            config: {}
          },
          {
            id: 'node2',
            type: 'factor_calculator',
            name: '因子计算',
            config: {}
          }
        ],
        connections: [
          {
            from: 'node1',
            to: 'node2'
          }
        ]
      }
    };

    const response = await fetch(`${QUANTFLOW_BASE}/api/workflow/query`, {
      method: 'POST',
      headers: {
        'uid': 'demo-user',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testWorkflow),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ 测试工作流创建成功');
      console.log(`📊 工作流ID: ${data.data?.id || 'Unknown'}`);
      return data.data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ 测试工作流创建失败:', response.status, errorData.message);
      return null;
    }
  } catch (error) {
    console.log('❌ 测试工作流创建异常:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 开始工作流同步测试...\n');

  // 1. 测试 QuantFlow 连接
  const quantflowWorkflows = await testQuantFlowConnection();
  console.log('');

  // 2. 测试 Next.js 应用连接
  const nextjsStatus = await testNextJSConnection();
  console.log('');

  // 3. 创建测试工作流
  const testWorkflow = await createTestWorkflow();
  console.log('');

  // 4. 测试工作流同步
  const syncResult = await testWorkflowSync();
  console.log('');

  // 5. 再次检查 QuantFlow 工作流
  console.log('🔍 再次检查 QuantFlow 工作流...');
  const updatedWorkflows = await testQuantFlowConnection();
  console.log('');

  // 总结
  console.log('📋 测试总结:');
  console.log(`✅ QuantFlow 服务: ${quantflowWorkflows.length > 0 ? '正常' : '无数据'}`);
  console.log(`✅ Next.js 应用: ${nextjsStatus ? '正常' : '异常'}`);
  console.log(`✅ 工作流同步: ${syncResult ? '成功' : '失败'}`);
  console.log(`✅ 测试工作流: ${testWorkflow ? '创建成功' : '创建失败'}`);
  
  if (updatedWorkflows.length > quantflowWorkflows.length) {
    console.log('🎉 工作流数量增加，同步功能正常！');
  } else {
    console.log('⚠️  工作流数量未变化，可能需要检查同步逻辑');
  }

  console.log('\n🌐 访问地址:');
  console.log(`- QuantFlow 工作流: ${QUANTFLOW_BASE}/quantflow/`);
  console.log(`- QuantFlow 超级图表: ${QUANTFLOW_BASE}/charts/`);
  console.log(`- Next.js 应用: ${NEXTJS_BASE}`);
  console.log(`- 策略工作流: ${NEXTJS_BASE}/ai-workflow`);
}

// 运行测试
main().catch(console.error);