import React from 'react';
import { Instagram, Facebook, Mail } from 'lucide-react';

export function TikTokSvg({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.32V8.2a8.38 8.38 0 0 0 4.91 1.6V6.37a4.88 4.88 0 0 1-1-.08z" />
    </svg>
  );
}

interface SocialLinksProps {
  config: {
    instagramUrl?: string;
    facebookUrl?: string;
    tiktokUrl?: string;
    email?: string;
    whatsappNumber?: string;
  };
  size?: number;
  className?: string;
  variant?: 'minimal' | 'pills' | 'header';
}

export default function SocialLinks({ config, size = 18, className = "", variant = 'minimal' }: SocialLinksProps) {
  const instagram = config.instagramUrl || "https://instagram.com";
  const facebook = config.facebookUrl || "https://facebook.com";
  const tiktok = config.tiktokUrl || "https://tiktok.com";

  if (variant === 'header') {
    return (
      <div className={`flex items-center gap-1.5 text-apple-text/80 ${className}`}>
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            title="Instagram"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 hover:text-pink-600 transition-all active:scale-95"
          >
            <Instagram size={size} />
          </a>
        )}
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            title="Facebook"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 hover:text-blue-600 transition-all active:scale-95"
          >
            <Facebook size={size} />
          </a>
        )}
        {tiktok && (
          <a
            href={tiktok}
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            title="TikTok"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 hover:text-black transition-all active:scale-95"
          >
            <TikTokSvg size={size} />
          </a>
        )}
      </div>
    );
  }

  if (variant === 'pills') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-apple-text text-xs font-medium border border-gray-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow hover:text-pink-600"
          >
            <Instagram size={14} />
            <span>Instagram</span>
          </a>
        )}
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-apple-text text-xs font-medium border border-gray-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow hover:text-blue-600"
          >
            <Facebook size={14} />
            <span>Facebook</span>
          </a>
        )}
        {tiktok && (
          <a
            href={tiktok}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-apple-text text-xs font-medium border border-gray-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow hover:text-black"
          >
            <TikTokSvg size={14} />
            <span>TikTok</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 text-apple-gray ${className}`}>
      {instagram && (
        <a
          href={instagram}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
          title="Instagram"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 hover:text-pink-600 transition-all"
        >
          <Instagram size={size} />
        </a>
      )}
      {facebook && (
        <a
          href={facebook}
          target="_blank"
          rel="noreferrer"
          aria-label="Facebook"
          title="Facebook"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 hover:text-blue-600 transition-all"
        >
          <Facebook size={size} />
        </a>
      )}
      {tiktok && (
        <a
          href={tiktok}
          target="_blank"
          rel="noreferrer"
          aria-label="TikTok"
          title="TikTok"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 hover:text-black transition-all"
        >
          <TikTokSvg size={size} />
        </a>
      )}
      {config.email && (
        <a
          href={`mailto:${config.email}`}
          aria-label="Correo"
          title="Correo"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 hover:text-apple-text transition-all"
        >
          <Mail size={size} />
        </a>
      )}
    </div>
  );
}
