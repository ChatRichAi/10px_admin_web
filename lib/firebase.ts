import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// 从环境变量获取私钥并正确处理
const getPrivateKey = () => {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is not set')
  }
  
  // 处理私钥格式
  return privateKey.replace(/\\n/g, '\n')
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: getPrivateKey(),
  }),
}

// 初始化Firebase Admin
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

// 获取Firestore实例
export const db = getFirestore(app)

export default app 