// Server component: no use client directive. LD provider lives in LDProviderWrapper.js to prevent hydration mismatches
import '@/components/LDProviderWrapper';
import LDProviderWrapper from '@/components/LDProviderWrapper';
import './globals.css';

export const metadata = {
  title: 'Analytics Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LDProviderWrapper>{children}</LDProviderWrapper>
      </body>
    </html>
  );
}