export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tasks/:path*',
    '/notes/:path*',
    '/expenses/:path*',
    '/habits/:path*',
    '/weather/:path*',
  ],
};
