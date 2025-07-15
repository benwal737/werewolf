'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export default function PageTheme({ children, forcedTheme }: {children: React.ReactNode, forcedTheme: string}) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(forcedTheme);
  }, []);

  return <div>{children}</div>;
}