export default function robots() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/dashboard', '/login', '/register', '/forgot-password', '/quiz/', '/result/'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
