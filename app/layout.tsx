import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Verixa',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <link rel="icon" href="/icon-light.svg" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/icon-dark.svg" media="(prefers-color-scheme: dark)" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#111827" />
        {/* Runtime favicon sync with site theme class */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var lightHref = '/icon-light.svg';
            var darkHref = '/icon-dark.svg';
            function setFavicon(href) {
              var link = document.querySelector('link[rel="icon"][data-dynamic]');
              if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel','icon');
                link.setAttribute('data-dynamic','true');
                document.head.appendChild(link);
              }
              if (link.getAttribute('href') !== href) link.setAttribute('href', href);
            }
            function isDark() {
              var html = document.documentElement;
              if (html.classList.contains('dark')) return true;
              if (html.classList.contains('light')) return false;
              return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            function apply() { setFavicon(isDark() ? darkHref : lightHref); }
            apply();
            // Observe class changes on <html>
            var mo = new MutationObserver(apply);
            mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
            // React to OS preference changes
            if (window.matchMedia) {
              var mq = window.matchMedia('(prefers-color-scheme: dark)');
              mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply);
            }
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
