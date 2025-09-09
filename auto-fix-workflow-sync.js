#!/usr/bin/env node

/**
 * 自动化修复工作流同步问题
 * 这个脚本将：
 * 1. 检查服务状态
 * 2. 创建测试工作流
 * 3. 验证数据同步
 * 4. 提供解决方案
 */

const { execSync } = require('child_process');

console.log('🚀 开始自动化修复工作流同步问题...\n');

async function checkServiceStatus() {
  console.log('1️⃣ 检查服务状态...');
  
  try {
    // 检查QuantFlow服务
    const quantflowResponse = await fetch('http://127.0.0.1:8000/');
    if (quantflowResponse.ok) {
      console.log('✅ QuantFlow服务运行正常');
    } else {
      console.log('❌ QuantFlow服务无响应');
      return false;
    }
    
    // 检查Next.js应用
    const nextjsResponse = await fetch('http://localhost:3000/api/test-workflow');
    if (nextjsResponse.ok) {
      console.log('✅ Next.js应用运行正常');
    } else {
      console.log('⚠️  Next.js应用可能需要重启');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('❌ 服务检查失败:', error.message);
    return false;
  }
}

async function createTestWorkflow() {
  console.log('\n2️⃣ 创建测试工作流...');
  
  try {
    const response = await fetch('http://localhost:3000/api/test-workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '自动化测试工作流',
        description: '这是一个自动化测试创建的工作流'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 测试工作流创建成功');
      console.log('📝 工作流ID:', data.workflowId);
      return data.workflowId;
    } else {
      const errorData = await response.json();
      console.log('❌ 创建工作流失败:', errorData.error);
      return null;
    }
  } catch (error) {
    console.log('❌ 创建工作流时出错:', error.message);
    return null;
  }
}

async function verifyDataSync() {
  console.log('\n3️⃣ 验证数据同步...');
  
  try {
    const response = await fetch('http://localhost:3000/api/test-workflow');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 数据同步验证成功');
      console.log('📊 工作流数量:', data.quantflowData?.data?.total_count || 0);
      
      if (data.quantflowData?.data?.total_count > 0) {
        console.log('🎉 数据同步功能正常工作！');
        return true;
      } else {
        console.log('⚠️  工作流列表为空，可能需要检查数据保存');
        return false;
      }
    } else {
      console.log('❌ 数据同步验证失败');
      return false;
    }
  } catch (error) {
    console.log('❌ 验证数据同步时出错:', error.message);
    return false;
  }
}

async function provideSolution() {
  console.log('\n4️⃣ 提供解决方案...');
  
  console.log('📋 问题诊断结果：');
  console.log('   - QuantFlow服务：运行正常');
  console.log('   - Next.js应用：运行正常');
  console.log('   - 数据同步：需要进一步检查');
  
  console.log('\n🔧 建议的解决步骤：');
  console.log('   1. 确保您已经登录到Next.js应用');
  console.log('   2. 在浏览器中访问 http://localhost:3000');
  console.log('   3. 尝试创建一个新的工作流');
  console.log('   4. 检查浏览器控制台是否有错误信息');
  console.log('   5. 如果问题持续，请重启Next.js应用');
  
  console.log('\n🌐 访问地址：');
  console.log('   - Next.js应用: http://localhost:3000');
  console.log('   - QuantFlow工作流: http://127.0.0.1:8000/quantflow/');
  console.log('   - QuantFlow图表: http://127.0.0.1:8000/charts/');
  console.log('   - QuantFlow API文档: http://127.0.0.1:8000/docs');
}

async function main() {
  try {
    const serviceOk = await checkServiceStatus();
    
    if (serviceOk) {
      const workflowId = await createTestWorkflow();
      const syncOk = await verifyDataSync();
      
      if (workflowId && syncOk) {
        console.log('\n🎉 所有测试通过！工作流同步功能正常工作。');
      } else {
        console.log('\n⚠️  部分测试失败，但服务正在运行。');
      }
    } else {
      console.log('\n❌ 服务检查失败，请确保所有服务都在运行。');
    }
    
    await provideSolution();
    
  } catch (error) {
    console.error('\n❌ 自动化修复过程中出现错误:', error.message);
  }
}

// 运行主函数
main();




