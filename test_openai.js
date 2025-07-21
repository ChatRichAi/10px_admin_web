const https = require('https');

const apiKey = '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';

console.log('测试OpenAI API密钥...');
console.log('API密钥:', apiKey.substring(0, 20) + '...');

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/models',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log('状态码:', res.statusCode);
  console.log('响应头:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ API密钥有效！');
        console.log('可用模型数量:', result.data?.length || 0);
      } else {
        console.log('❌ API密钥无效');
        console.log('错误信息:', result);
      }
    } catch (e) {
      console.log('❌ 响应解析失败:', e.message);
      console.log('原始响应:', data);
    }
  });
});

req.on('error', (e) => {
  console.log('❌ 请求失败:', e.message);
});

req.end();
