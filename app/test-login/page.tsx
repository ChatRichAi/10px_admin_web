"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("登录成功，session:", session);
      // 延迟跳转，确保session已设置
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">登录状态测试</h1>
        
        <div className="space-y-4">
          <div>
            <strong>状态:</strong> {status}
          </div>
          
          {session ? (
            <div>
              <strong>用户信息:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          ) : (
            <div>
              <strong>未登录</strong>
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={() => router.push("/sign-in")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              返回登录页面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 