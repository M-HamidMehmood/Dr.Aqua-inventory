import React from 'react'

/**
 * Dr. Aqua Official Logo Component
 * High-fidelity representation based on /public/images/logo.png
 * Supports 'full' (complete brand text with styled 'Q' droplet) and 'icon' (emblem Q droplet only).
 */
export default function DrAquaLogo({
  variant = 'full',
  size = 'default', // 'sm' | 'default' | 'lg' | 'xl'
  className = '',
  useImage = false, // Set to true to use original raster image directly
}) {
  if (useImage) {
    const heightClass =
      size === 'sm'
        ? 'h-7'
        : size === 'lg'
        ? 'h-12'
        : size === 'xl'
        ? 'h-16'
        : 'h-9'

    return (
      <img
        src="/images/logo.png"
        alt="Dr. Aqua"
        className={`object-contain w-auto select-none ${heightClass} ${className}`}
      />
    )
  }

  // Pure Scalable Vector Emblem (Water Droplet + Red Ring of 'Q' + Red Swoop Wave)
  if (variant === 'icon') {
    const dim = size === 'sm' ? 28 : size === 'lg' ? 48 : size === 'xl' ? 60 : 36
    return (
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 select-none ${className}`}
      >
        <defs>
          <linearGradient id="draqua-drop" x1="50" y1="12" x2="50" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <filter id="drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Scarlet Red Outer Ring of 'Q' */}
        <circle cx="50" cy="46" r="32" stroke="#E31E24" strokeWidth="9" fill="none" />

        {/* Inner Water Droplet */}
        <path
          d="M50 16 C50 16, 34 38, 34 50 C34 59 41.2 66 50 66 C58.8 66 66 59 66 50 C66 38, 50 16, 50 16 Z"
          fill="url(#draqua-drop)"
          filter="url(#drop-shadow)"
        />

        {/* Droplet Light Highlight Curve */}
        <path
          d="M38 52 C39 59 44 63 50 63"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* Swooping Wave Tail of 'Q' */}
        <path
          d="M35 80 C48 76, 56 82, 70 86 C78 88, 86 84, 88 82 C86 86, 75 92, 64 91 C50 90, 42 83, 35 80 Z"
          fill="#E31E24"
        />
      </svg>
    )
  }

  // Full High-Level Vector Wordmark ("Dr. A" + Q[droplet] + "UA")
  const height = size === 'sm' ? 30 : size === 'lg' ? 46 : size === 'xl' ? 56 : 38
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        height={height}
        viewBox="0 0 340 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="draqua-drop-full" x1="184" y1="14" x2="184" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* "Dr. A" - Dark Royal Purple Serif */}
        <text
          x="6"
          y="66"
          fontFamily="'Times New Roman', Georgia, serif"
          fontSize="68"
          fontWeight="bold"
          fill="#312783"
          letterSpacing="-1"
        >
          Dr.A
        </text>

        {/* 'Q' Red Ring */}
        <circle cx="184" cy="46" r="28" stroke="#E31E24" strokeWidth="8" fill="none" />

        {/* 'Q' Water Droplet in Center */}
        <path
          d="M184 18 C184 18, 170 36, 170 46 C170 54 176.2 60 184 60 C191.8 60 198 54 198 46 C198 36, 184 18, 184 18 Z"
          fill="url(#draqua-drop-full)"
        />
        {/* Droplet Highlight */}
        <path
          d="M174 48 C175 54 179 57 184 57"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* 'Q' Red Wave Underline Tail */}
        <path
          d="M170 76 C182 72, 192 78, 206 82 C216 85, 226 81, 230 78 C226 84, 214 90, 202 88 C188 86, 178 79, 170 76 Z"
          fill="#E31E24"
        />

        {/* "UA" - Dark Royal Purple Serif */}
        <text
          x="218"
          y="66"
          fontFamily="'Times New Roman', Georgia, serif"
          fontSize="68"
          fontWeight="bold"
          fill="#312783"
          letterSpacing="-1"
        >
          UA
        </text>
      </svg>
    </div>
  )
}
