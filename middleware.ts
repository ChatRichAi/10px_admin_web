// 临时禁用所有认证中间件
export default function middleware(req: any) {
  // 直接允许所有请求通过
  return
}

export const config = {
  matcher: [
    /*
     * 临时禁用中间件以解决API访问问题
     * 只匹配需要认证的页面路由
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 