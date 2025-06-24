import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // 在这里可以添加额外的中间件逻辑
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // 获取请求的路径
        const { pathname } = req.nextUrl

        // 公开路由，不需要认证
        const publicRoutes = [
          '/',
          '/sign-in',
          '/sign-up',
          '/api/auth',
          '/pricing',
          '/verify-code',
          '/verify-your-identity',
        ]

        // 检查是否为公开路由
        const isPublicRoute = publicRoutes.some(route => 
          pathname.startsWith(route)
        )

        // 如果是公开路由，直接允许访问
        if (isPublicRoute) {
          return true
        }

        // 对于受保护的路由，需要有效的token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api/auth/* (认证API路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - images/* (公共图片)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 