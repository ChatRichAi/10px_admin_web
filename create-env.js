#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 管理员账户信息
const adminEmail = '10px@tutamail.com';
const adminPassword = 'admin1234';

// 简化的环境变量内容（不包含复杂的私钥）
const envContent = `# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=7pT2+41TiYi2lCOZ0MPb0pTFHP3Dbh0P8RaGuKGQDN4=

# Firebase 配置
FIREBASE_PROJECT_ID=px-9c1bd
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@px-9c1bd.iam.gserviceaccount.com

# 注意：请手动添加您的 Firebase 私钥
# FIREBASE_PRIVATE_KEY="您的私钥内容"

# OpenAI 配置
OPENAI_API_KEY=sk-your-openai-api-key-here

# 管理员邮箱配置
ADMIN_EMAILS=${adminEmail}
`;

// 写入.env.local文件
const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local 文件创建成功！');
  console.log(`📧 管理员邮箱: ${adminEmail}`);
  console.log(`🔑 管理员密码: ${adminPassword}`);
  console.log('\n⚠️  重要提醒:');
  console.log('您需要手动添加 Firebase 私钥到 .env.local 文件中');
  console.log('请将以下内容添加到 FIREBASE_PRIVATE_KEY 行:');
  console.log('');
  console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----');
  console.log('MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNgrtHdFQquZji');
  console.log('k32lOLjNXFHiS3F0YF1JB/vfVCfDboJVYYFUh5HS8xun/hk1U+FUeIZ3McoCUIJf');
  console.log('3uBB2B4oZc10Rh9JDfUy36eHfKbj1LFeVgj0CsgT83GxgAk8FWfB0OwvbIMEheHY');
  console.log('+4/8UoCakZzT8PFTMXLtE5R+bqs7f86O97t8uKZ+xRSZhdLEgVTWHkufnSyyfeZ');
  console.log('YTpzu9IouqVE/qgggn655DTi1DIQYGA03E6Qo26/OMUWMMvI66ZGjHWvOKq8yIvp');
  console.log('din8p2SArngDe6pd/VHdr7NK65GE7jkbjomAnYQ0TTVIZiEs482CRUwe6RXnAmtH');
  console.log('pYW+yqDdAgMBAAECggEAFDadkQOiG6mxned/3jZcBubjruxYtmecBUjhvy+Z0aEW');
  console.log('9Kroe5XyA9uhhr55YENl0FcicqrVAbFFgYR8bj2Bidupf5w+C4Nx8JUK90qNZ69N');
  console.log('2sd/jfFZiIzTS/AZ+Gzqjaes82Uq5dD9S78/Qc7Lxr0JPOJFkSxh8A1F/s4fTE7X');
  console.log('Qp1haKg68Tz6QH3t88dEdt4xklrwDVqed4ooNIYNqg45WiRlazRxO23I9ef5L/4S');
  console.log('xANZ2YgZR/yDfB7iuLFyXwcZwcgsmizHUqs0Y/kmbCW/b/bl1kII690/QW0DVIYQ');
  console.log('IIIhOUfhbjPkEoY04ClbGyRYO8xq+0Hb/JemsZVhAQKBgQDmiKBF4cV3h4r2TZWv');
  console.log('PY2bPmgOxOHu9tJdOKq69OggNZFAQvjuKF8XtEaieJk1Nd5d7Z/AogxH/KKqTmHE');
  console.log('hGd66HamMz0rqj9OrdceMdvkYDSVC+IkJAeolhWBMupi3a+CxQgrp8qJZN7wiv3g');
  console.log('Kbs2dByGaTc9hXNYNE8ACsE5IQKBgQDkNnedktL242tK1n/tWLArkNKIajoDnieV');
  console.log('2BHuWfYo7il/XSM2Squvd2WjbNCCYA66JzjTorzZEzcMiZnbXC3yUY5uoAvDmxls');
  console.log('RuEWyTl+fJtsEsBLKiiHSb1/RapqZwLL/9uGdWoa5XWk/dArykczCMenwmCjQYP8');
  console.log('Be3InOuEPQKBgQC22ju18iP8cQgp4NQPUVVWg6Npw4QpVKD6zA2viL3tfk+dlwF3');
  console.log('dZInbRhxmhJ7gCTGf8osstvm5V3ok488noCtnmEt5opobfsU3xI3ovh1JlHOvsQ6');
  console.log('QlHIyHJ6LfZ3QLsLkFiwt8AQRnAGf1hrSu5xfJt7iU0FgSpCFgtrTxx/wQKBgQDb');
  console.log('fkuTwZiontkd9Kq75FYkwLjNPaYovp+CLnwojFwGx/IfrrvkRvNT43ldMpZlHvBr');
  console.log('OLgeTWJnQmTq6RmS8ti6PJjKa6KE8xMDojRxzv4+Wqi9zFcotBag8FqTI7Uhe4wk');
  console.log('GyTP8PQphFKfawMiav4J5sLo5jo+KxA/gJBQKCUZXQKBgGAk0mmctJvzLjbfILLO');
  console.log('OtuKbosBm9XVITf9xxy1hRWzgNVhmanCBCax73JpmmmdqLjaBzO2c8sSjoOp5Kz6');
  console.log('XWX8jeBn/L6BpY8GCNOurlNX+Cfh/kOxvwGfrk9uSzxw1hviyHvPuXGRXoCimfP6');
  console.log('2N2rbJxE01uLCG3U6lmqBwoX');
  console.log('-----END PRIVATE KEY-----"');
  console.log('');
  console.log('📋 下一步操作:');
  console.log('1. 编辑 .env.local 文件，添加上述私钥');
  console.log('2. 重启开发服务器: npm run dev');
  console.log('3. 访问: http://localhost:3000/setup-admin');
  console.log('4. 点击"创建管理员账户"按钮');
  console.log('5. 使用上述邮箱和密码登录');
  console.log('6. 访问管理后台: http://localhost:3000/admin');
} catch (error) {
  console.error('❌ 创建.env.local文件失败:', error.message);
  console.log('\n📝 请手动创建.env.local文件，内容如下:');
  console.log(envContent);
} 