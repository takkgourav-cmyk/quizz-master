import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'Quizly — A better way to keep learning', template: '%s | Quizly' },
  applicationName: 'Quizly',
  description: 'Explore thoughtful quizzes, review what you learn, and keep track of your progress with Quizly.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Quizly',
    title: 'Quizly — A better way to keep learning',
    description: 'Explore thoughtful quizzes, review what you learn, and keep track of your progress with Quizly.',
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: 'Quizly — A better way to keep learning',
    description: 'Explore thoughtful quizzes, review what you learn, and keep track of your progress with Quizly.',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
      </head>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Quizly',
              description: 'Explore thoughtful quizzes, review what you learn, and keep track of your progress.',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            }).replace(/</g, '\\u003c'),
          }}
        />
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
