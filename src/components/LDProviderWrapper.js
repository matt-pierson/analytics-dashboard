'use client';
/**
 * This must be a separate client component so layout.js stays a Server Component
 * and avoids Next.js App Router hydration mismatches.
 */
import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk';
import { useEffect, useState } from 'react';
import { users } from '@/lib/userContexts';

export default function LDProviderWrapper({ children }) {
  const [LDProvider, setLDProvider] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initLDProvider() {
      const provider = await asyncWithLDProvider({
        clientSideID: process.env.NEXT_PUBLIC_LD_CLIENT_KEY,
        user: users.standard,
        streaming: true,
      });
      if (isMounted) {
        setLDProvider(() => provider);
      }
    }

    initLDProvider();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!LDProvider) {
    return <>{children}</>;
  }

  return <LDProvider>{children}</LDProvider>;
}