#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔥 Firebase 私钥获取指南');
console.log('========================\n');

console.log('📋 请按照以下步骤操作：\n');

console.log('1️⃣  打开Firebase控制台');
console.log('   链接: https://console.firebase.google.com/');
console.log('   使用您的Google账户登录\n');

console.log('2️⃣  选择或创建项目');
console.log('   - 如果已有项目，选择 "px-9c1bd"');
console.log('   - 如果没有项目，点击 "创建项目"\n');

console.log('3️⃣  进入项目设置');
console.log('   - 点击左侧齿轮图标 ⚙️');
console.log('   - 选择 "项目设置"\n');

console.log('4️⃣  生成服务账户密钥');
console.log('   - 切换到 "服务账户" 标签页');
console.log('   - 点击 "生成新的私钥"');
console.log('   - 选择 "Firebase Admin SDK"');
console.log('   - 点击 "生成密钥"\n');

console.log('5️⃣  下载JSON文件');
console.log('   - 系统会自动下载一个JSON文件');
console.log('   - 文件名类似: px-9c1bd-firebase-adminsdk-xxxxx-xxxxxxxxxx.json\n');

console.log('6️⃣  提取私钥信息');
console.log('   - 打开下载的JSON文件');
console.log('   - 复制以下字段的值:\n');

console.log('   📝 需要的信息:');
console.log('   - project_id');
console.log('   - client_email');
console.log('   - private_key\n');

// 询问用户是否已完成上述步骤
rl.question('✅ 您是否已完成上述步骤？(y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n🎉 太好了！现在请输入您的Firebase信息：\n');
    
    // 收集Firebase信息
    rl.question('📁 项目ID (project_id): ', (projectId) => {
      rl.question('📧 客户端邮箱 (client_email): ', (clientEmail) => {
        console.log('\n🔑 私钥 (private_key):');
        console.log('请将整个私钥内容粘贴到这里（包括 -----BEGIN PRIVATE KEY----- 和 -----END PRIVATE KEY-----）:');
        
        let privateKey = '';
        rl.on('line', (line) => {
          if (line.includes('-----END PRIVATE KEY-----')) {
            privateKey += line;
            
            // 创建.env.local文件
            createEnvFile(projectId, clientEmail, privateKey);
            rl.close();
          } else {
            privateKey += line + '\n';
          }
        });
      });
    });
  } else {
    console.log('\n📚 请先完成上述步骤，然后重新运行此脚本。');
    console.log('💡 提示：您可以将此脚本保持运行，完成步骤后再回答 y');
    rl.close();
  }
});

function createEnvFile(projectId, clientEmail, privateKey) {
  const envContent = `# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=7pT2+41TiYi2lCOZ0MPb0pTFHP3Dbh0P8RaGuKGQDN4=

# Firebase 配置
FIREBASE_PROJECT_ID=${projectId}
FIREBASE_CLIENT_EMAIL=${clientEmail}
FIREBASE_PRIVATE_KEY="${privateKey.trim()}"

# OpenAI 配置
OPENAI_API_KEY=sk-your-openai-api-key-here

# 管理员邮箱配置
ADMIN_EMAILS=10px@tutamail.com
`;

  const envPath = path.join(__dirname, '.env.local');

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local 文件创建成功！');
    console.log('\n📋 下一步操作:');
    console.log('1. 重启开发服务器: npm run dev');
    console.log('2. 访问: http://localhost:3000/setup-admin');
    console.log('3. 点击"创建管理员账户"按钮');
    console.log('4. 使用邮箱 10px@tutamail.com 和密码 admin1234 登录');
    console.log('5. 访问管理后台: http://localhost:3000/admin');
    console.log('\n🎉 恭喜！您的Firebase配置已完成！');
  } catch (error) {
    console.error('❌ 创建.env.local文件失败:', error.message);
    console.log('\n📝 请手动创建.env.local文件，内容如下:');
    console.log(envContent);
  }
} 