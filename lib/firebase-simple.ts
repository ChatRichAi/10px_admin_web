import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// 直接使用服务账户配置
const serviceAccount = {
  type: "service_account",
  project_id: "px-9c1bd",
  private_key_id: "a20b65ebf6e23c94a6246c4c510ed9cab2fe76bf",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/KVlqEryPGYFb\nc8RMF8Pv8vYvnR880WXdfzDUQ4zG0mrpj2HDjdqmIOrVShWetLqkalxcXfOcfdzZ\nQO9R4AUValSMzW7/0WBBVtiu/gVIQK6zXEcqtbQWG7fXtOzTYqFkZLPSc7MBNRUg\nPHRU01rHOfS1DJPdwPI0B1en/a9yDxPzo1LVn6kMn8iBvc0vkeNf87myQatOQcXe\n+K12TWKpUlbHiqA5pvUgNbZifYdNguE/9F6XAnWUjRrjMkHjtZ0Q7XDWTC/MS188\n7mC5GpptPhQdh3vcevvXzDriC5reR74DDLEQrpCoPTbHXcNOVkPmQvzaNwrj3HIY\nmYv4DGLRAgMBAAECggEAMOBNJNJilMIEMZJRc9U1u2GnMXhedsnhXjc5kGQvF9zQ\nCiSnbf0UlRpggKVfDsON3yD0uYcqFO6Xa5LvPcNl+VpFAPU7trvdfQdMAr4fMqCb\nKm/jIFfyEh8HK+duEAQtWMJoudvsPlhIrQPYCKI7mSnH2Ay9t9qv8r6X2nOCCsq/\nbzvjMB8t8ea/DU//Zy8hTWHOn20k+AfLBf60mBgdFHfmh6J8Hrr8xBYcAh2cCRD5\nslsoQrkUOHczOYSTHPtZ6KzzqO2ciTVBAUscj46Jmke7Fqu6qq790ctqx7wyaybC\nu9GYBmkK4NGtaZPAyiUGms6mxsdrWPb2+R1kDKvS6wKBgQD0uYJHVaX3IPQRwtXz\nbPeFqj6nClo1dbH4MrMnawmY1zYJpIfYrDZKtLwCryoF5/ipJ32JeGjlWqzxQyzQ\nu832Qinmjy/AuBj0PXRc7Q7tbynp13qu78s+drjIu7jYjN1kXViM/xK56Ajq9x8C\nqvTj+FGX5KeARQs9HKaLs6ni0wKBgQDH+BI8A5JLeZzNtvvDAkuGo3DzIm86D9Mb\nuNlm/NMBjWhBExN3aQgkyPn+nmD0gtWr4zF4XPNOIGqoxSBIaNXgsb0IzS8BItIk\nf528eIN3JDy8qHDdLHXr4zzqe1gBLDBN83ZA5cyODeABe9lNoyGQVOUn23ibmHrX\n5W6aNiH1SwKBgADSTpmms/PsbGVS3hz/FKWiOKue4UakqoBGy0sqlNGqh0fpAXu8\nuEHv8WGg7OcwLCmFNGqtuMxsTYBR1Wit+LcG6dUYTfS7qXnIaweU1CP/54gdbRAB\nRhFjnKMv3iL79hJMLevrP0jYeo8vXS9JG6FYSA3Weql3kd4Wpoh5hex5AoGATJLq\nKKEVfGFtcjkH330Zfs1Hi1M8VHeK16rJVW6rPoTvzzuG0MsfmzZ6xM3RQtB3EgNG\nBllRsjEnpskVu6SpggmN4bjwrvaukdtsg6eCcDUoLPYzgf5siY/S29evs4NAXBlG\nx0M4OY2GogrTA6/cQnC/76tTXAHfyJzK5bKk/lECgYEA52fkbikDOiPGUenrejn6\nJmk+hfo/Bz3O+cdNThUwbKziGiEY2Vn2v3AWRTWzcC6jca8D134XlMgdsNeUO0Vm\nhCGzuhC6wcg04kErFFu2JX3UWPUnC9vpAyYdoKgIj4hQILotkDYV23Hs3KhgX/Zj\nAj9/IPLwzD0NLczYKSnySZk=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@px-9c1bd.iam.gserviceaccount.com",
  client_id: "111319199111884970801",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40px-9c1bd.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}

const firebaseAdminConfig = {
  credential: cert(serviceAccount as any),
}

// 初始化Firebase Admin
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

// 获取Firestore实例
export const db = getFirestore(app)

export default app 