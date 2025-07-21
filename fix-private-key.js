#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复Firebase私钥格式');
console.log('======================\n');

// 正确的私钥内容（从您的JSON文件提取）
const correctPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/KVlqEryPGYFb
c8RMF8Pv8vYvnR880WXdfzDUQ4zG0mrpj2HDjdqmIOrVShWetLqkalxcXfOcfdzZ
QO9R4AUValSMzW7/0WBBVtiu/gVIQK6zXEcqtbQWG7fXtOzTYqFkZLPSc7MBNRUg
PHRU01rHOfS1DJPdwPI0B1en/a9yDxPzo1LVn6kMn8iBvc0vkeNf87myQatOQcXe
+K12TWKpUlbHiqA5pvUgNbZifYdNguE/9F6XAnWUjRrjMkHjtZ0Q7XDWTC/MS188
7mC5GpptPhQdh3vcevvXzDriC5reR74DDLEQrpCoPTbHXcNOVkPmQvzaNwrj3HIY
mYv4DGLRAgMBAAECggEAMOBNJNJilMIEMZJRc9U1u2GnMXhedsnhXjc5kGQvF9zQ
CiSnbf0UlRpggKVfDsON3yD0uYcqFO6Xa5LvPcNl+VpFAPU7trvdfQdMAr4fMqCb
Km/jIFfyEh8HK+duEAQtWMJoudvsPlhIrQPYCKI7mSnH2Ay9t9qv8r6X2nOCCsq/
bzvjMB8t8ea/DU//Zy8hTWHOn20k+AfLBf60mBgdFHfmh6J8Hrr8xBYcAh2cCRD5
slsoQrkUOHczOYSTHPtZ6KzzqO2ciTVBAUscj46Jmke7Fqu6qq790ctqx7wyaybC
u9GYBmkK4NGtaZPAyiUGms6mxsdrWPb2+R1kDKvS6wKBgQD0uYJHVaX3IPQRwtXz
bPeFqj6nClo1dbH4MrMnawmY1zYJpIfYrDZKtLwCryoF5/ipJ32JeGjlWqzxQyzQ
u832Qinmjy/AuBj0PXRc7Q7tbynp13qu78s+drjIu7jYjN1kXViM/xK56Ajq9x8C
qvTj+FGX5KeARQs9HKaLs6ni0wKBgQDH+BI8A5JLeZzNtvvDAkuGo3DzIm86D9Mb
uNlm/NMBjWhBExN3aQgkyPn+nmD0gtWr4zF4XPNOIGqoxSBIaNXgsb0IzS8BItIk
f528eIN3JDy8qHDdLHXr4zzqe1gBLDBN83ZA5cyODeABe9lNoyGQVOUn23ibmHrX
5W6aNiH1SwKBgADSTpmms/PsbGVS3hz/FKWiOKue4UakqoBGy0sqlNGqh0fpAXu8
uEHv8WGg7OcwLCmFNGqtuMxsTYBR1Wit+LcG6dUYTfS7qXnIaweU1CP/54gdbRAB
RhFjnKMv3iL79hJMLevrP0jYeo8vXS9JG6FYSA3Weql3kd4Wpoh5hex5AoGATJLq
KKEVfGFtcjkH330Zfs1Hi1M8VHeK16rJVW6rPoTvzzuG0MsfmzZ6xM3RQtB3EgNG
BllRsjEnpskVu6SpggmN4bjwrvaukdtsg6eCcDUoLPYzgf5siY/S29evs4NAXBlG
x0M4OY2GogrTA6/cQnC/76tTXAHfyJzK5bKk/lECgYEA52fkbikDOiPGUenrejn6
Jmk+hfo/Bz3O+cdNThUwbKziGiEY2Vn2v3AWRTWzcC6jca8D134XlMgdsNeUO0Vm
hCGzuhC6wcg04kErFFu2JX3UWPUnC9vpAyYdoKgIj4hQILotkDYV23Hs3KhgX/Zj
Aj9/IPLwzD0NLczYKSnySZk=
-----END PRIVATE KEY-----`;

// 创建正确的.env.local文件内容
const envContent = `# NextAuth 配置
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=7pT2+41TiYi2lCOZ0MPb0pTFHP3Dbh0P8RaGuKGQDN4=

# Firebase 配置 (修复后的私钥格式)
FIREBASE_PROJECT_ID=px-9c1bd
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@px-9c1bd.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="${correctPrivateKey}"

# OpenAI 配置
OPENAI_API_KEY=sk-your-openai-api-key-here

# 管理员邮箱配置
ADMIN_EMAILS=10px@tutamail.com
`;

// 写入.env.local文件
const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local 文件已修复！');
  console.log('\n📋 修复内容:');
  console.log('   - 修复了私钥的换行符格式');
  console.log('   - 更新了NEXTAUTH_URL为localhost:3001');
  console.log('   - 确保私钥格式正确');
  
  console.log('\n📧 管理员账户信息:');
  console.log('   邮箱: 10px@tutamail.com');
  console.log('   密码: admin1234');
  
  console.log('\n🚀 下一步操作:');
  console.log('1. 重启开发服务器: npm run dev');
  console.log('2. 访问: http://localhost:3001/setup-admin');
  console.log('3. 点击"创建管理员账户"按钮');
  console.log('4. 使用上述邮箱和密码登录');
  console.log('5. 访问管理后台: http://localhost:3001/admin');
  
  console.log('\n🎉 私钥格式已修复！现在应该可以正常工作了！');
  
} catch (error) {
  console.error('❌ 修复.env.local文件失败:', error.message);
  console.log('\n📝 请手动修复.env.local文件，确保私钥格式正确:');
  console.log('\n' + '='.repeat(50));
  console.log(envContent);
  console.log('='.repeat(50));
} 