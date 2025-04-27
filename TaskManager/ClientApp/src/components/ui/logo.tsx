'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  showText?: boolean;
  textClassName?: string;
  className?: string;
  href?: string;
}

export function Logo({
  width = 48,
  height = 48,
  showText = true,
  textClassName = "ml-2 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline-block",
  className = "transition-transform group-hover:scale-110",
  href = "/boards"
}: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [logoSrc, setLogoSrc] = useState('/doit-logo.png');
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely check the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Determine if we should use the dark logo
    const currentTheme = theme === 'system' ? systemTheme : theme;
    setLogoSrc(currentTheme === 'dark' ? '/doit-dark.png' : '/doit-logo.png');
  }, [theme, systemTheme, mounted]);

  const logoContent = (
    <>
      <Image 
        src={logoSrc}
        alt="DOIT!" 
        width={width}
        height={height}
        className={className}
        priority
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className="group flex items-center transition-all">
        {logoContent}
      </Link>
    );
  }

  return (
    <div className="group flex items-center transition-all">
      {logoContent}
    </div>
  );
}