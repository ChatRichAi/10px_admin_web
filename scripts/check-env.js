#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 检查注册登录系统环境配置...\n');

// 检查必需的环境变量
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
];

const optionalEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'ADMIN_EMAILS',
];

// 检查 .env.local 文件是否存在
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log(`📁 .env.local 文件: ${envExists ? '✅ 存在' : '❌ 不存在'}`);

if (!envExists) {
  console.log('\n⚠️  请创建 .env.local 文件并配置必要的环境变量');
  console.log('参考 SETUP_GUIDE.md 中的配置说明\n');
}

// 检查环境变量
let allRequiredPresent = true;
let someOptionalPresent = false;

console.log('\n🔑 必需的环境变量:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = !!value;
  const status = isPresent ? '✅' : '❌';
  
  if (!isPresent) allRequiredPresent = false;
  
  // 隐藏敏感信息
  const displayValue = isPresent 
    ? (varName.includes('SECRET') || varName.includes('PRIVATE_KEY') 
       ? '[已设置]' 
       : value.substring(0, 10) + '...')
    : '[未设置]';
    
  console.log(`  ${status} ${varName}: ${displayValue}`);
});

console.log('\n🔧 可选的环境变量:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = !!value;
  const status = isPresent ? '✅' : '⚪';
  
  if (isPresent) someOptionalPresent = true;
  
  const displayValue = isPresent 
    ? (varName.includes('SECRET') 
       ? '[已设置]' 
       : value.substring(0, 10) + '...')
    : '[未设置]';
    
  console.log(`  ${status} ${varName}: ${displayValue}`);
});

// 检查依赖包
console.log('\n📦 检查关键依赖包:');
const requiredPackages = [
  'next-auth',
  'firebase-admin',
  'bcryptjs',
  '@next-auth/firebase-adapter',
  'stripe',
];

requiredPackages.forEach(packageName => {
  try {
    require.resolve(packageName);
    console.log(`  ✅ ${packageName}: 已安装`);
  } catch (e) {
    console.log(`  ❌ ${packageName}: 未安装`);
  }
});

// 总结
console.log('\n📊 配置状态总结:');
console.log(`  环境文件: ${envExists ? '✅' : '❌'}`);
console.log(`  必需变量: ${allRequiredPresent ? '✅' : '❌'}`);
console.log(`  可选变量: ${someOptionalPresent ? '✅' : '⚪'}`);

if (allRequiredPresent && envExists) {
  console.log('\n🎉 环境配置看起来不错！可以运行应用了');
  console.log('运行: npm run dev');
} else {
  console.log('\n⚠️  请完成环境配置后再启动应用');
  console.log('参考: SETUP_GUIDE.md');
}

console.log('\n' + '='.repeat(50)); 