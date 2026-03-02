import './globals.css';
import localFont from 'next/font/local';
import ToastManager from '@/components/reusables/ToasterManager';
import AlertDialog from '@/components/reusables/AlertDialog';
import Script from 'next/script';
import { AuthProvider } from '@/hooks/useAuth';

// Import Urbanist Font
const sans = localFont({
  src: [
    { path: '../public/fonts/Sans/SourceSans3-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Sans/SourceSans3-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../public/fonts/Sans/SourceSans3-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/Sans/SourceSans3-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

// Import Caveat Font
const caveat = localFont({
  src: '../public/fonts/Caveat/Caveat-Regular.ttf',
  weight: '500',
  style: 'normal',
  variable: '--font-caveat',
  display: 'swap',
});

// Import Roboto Font
const roboto = localFont({
  src: [
    { path: '../public/fonts/Roboto/Roboto-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../public/fonts/Roboto/Roboto-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../public/fonts/Roboto/Roboto-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-roboto',
  display: 'swap',
});


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-6ER1DYDD1V" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-6ER1DYDD1V');
          `}
        </Script>
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "qzzgf0tv9a");
          `}
        </Script>
      </head>
      <body className={`${sans.variable} ${caveat.variable} ${roboto.variable}`}>
          <AuthProvider>
            {children}
          </AuthProvider>
          <ToastManager />
          <AlertDialog />
      </body>
    </html>
  );
}
