'use client';
// separate client component keeps layout.js a server component, preventing hydration mismatches
import { asyncWithLDProvider, useLDClient } from 'launchdarkly-react-client-sdk';
import { useEffect, useState } from 'react';
import { users } from '@/lib/userContexts';
import { setLDClient } from '@/lib/ldClient';

function LDClientCapture() {
  const client = useLDClient();
  useEffect(() => {
    if (client) setLDClient(client);
  }, [client]);
  return null;
}

export default function LDProviderWrapper({ children }) {
  const [LDProvider, setLDProvider] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function initLDProvider() {
      // use context not user, streaming and sendEvents must be nested inside options
      const provider = await asyncWithLDProvider({
        clientSideID: process.env.NEXT_PUBLIC_LD_CLIENT_KEY,
        context: users.standard,
        options: {
          streaming: true,
          sendEvents: true,

        },
      });
      if (isMounted) {
        setLDProvider(() => provider);
      }
    }

    initLDProvider();
    return () => { isMounted = false; };
  }, []);

  if (!LDProvider) return <>{children}</>;

  return (
    <LDProvider>
      <LDClientCapture />
      {children}
    </LDProvider>
  );
}