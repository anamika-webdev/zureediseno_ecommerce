import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,jsx,ts,tsx,html}",
		"./components/**/*.{js,jsx,ts,tsx,html}",
		"./app/**/*.{js,jsx,ts,tsx,html}",
		"./src/**/*.{js,jsx,ts,tsx,html}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '2rem',
				lg: '4rem',
				xl: '5rem',
				'2xl': '6rem',
			},
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					50: 'rgb(var(--primary-50) / <alpha-value>)',
					100: 'rgb(var(--primary-100) / <alpha-value>)',
					200: 'rgb(var(--primary-200) / <alpha-value>)',
					300: 'rgb(var(--primary-300) / <alpha-value>)',
					400: 'rgb(var(--primary-400) / <alpha-value>)',
					500: 'rgb(var(--primary-500) / <alpha-value>)',
					600: 'rgb(var(--primary-600) / <alpha-value>)',
					700: 'rgb(var(--primary-700) / <alpha-value>)',
					800: 'rgb(var(--primary-800) / <alpha-value>)',
					900: 'rgb(var(--primary-900) / <alpha-value>)',
					950: 'rgb(var(--primary-950) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				zuree: {
					red: {
						DEFAULT: '#e63946',
						light: '#ff6b7a',
						dark: '#c62d3a',
						50: '#fef2f2',
						100: '#fee2e2',
						200: '#fecaca',
						300: '#fca5a5',
						400: '#f87171',
						500: '#e63946',
						600: '#dc2626',
						700: '#b91c1c',
						800: '#991b1b',
						900: '#7f1d1d',
					},
					beige: {
						DEFAULT: '#f8f5f0',
						light: '#fdfcfa',
						dark: '#e8e5e0',
						50: '#fdfcfa',
						100: '#f8f5f0',
						200: '#f0ebe3',
						300: '#e8e1d6',
						400: '#d0c7b8',
						500: '#b8ad9a',
						600: '#9a8e7b',
						700: '#7c6f5c',
						800: '#5e503d',
						900: '#40311e',
					},
					dark: {
						DEFAULT: '#333333',
						light: '#4a4a4a',
						darker: '#1a1a1a',
						50: '#fafafa',
						100: '#f5f5f5',
						200: '#e5e5e5',
						300: '#d4d4d4',
						400: '#a3a3a3',
						500: '#737373',
						600: '#525252',
						700: '#404040',
						800: '#333333',
						900: '#171717',
					},
					light: {
						DEFAULT: '#ffffff',
						gray: '#f9fafb',
						50: '#ffffff',
						100: '#f9fafb',
						200: '#f3f4f6',
						300: '#e5e7eb',
						400: '#d1d5db',
						500: '#9ca3af',
						600: '#6b7280',
						700: '#4b5563',
						800: '#374151',
						900: '#1f2937',
					}
				},
				// Enhanced gray scale for better dark mode support
				gray: {
					50: '#fafafa',
					100: '#f5f5f5',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717',
					950: '#0a0a0a',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xs': '0.125rem',
				'3xl': '1.5rem',
				'4xl': '2rem',
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
				'6xl': ['3.75rem', { lineHeight: '1' }],
				'7xl': ['4.5rem', { lineHeight: '1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				// Enhanced animations for better UX
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				'slide-in-from-top': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-in-from-bottom': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-in-from-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-in-from-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'scale-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' },
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.05)', opacity: '1' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)' },
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' },
				},
				'marquee': {
					'0%': { transform: 'translateX(0%)' },
					'100%': { transform: 'translateX(-100%)' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-in-out',
				'fade-out': 'fade-out 0.5s ease-in-out',
				'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
				'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
				'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
				'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-in',
				'bounce-in': 'bounce-in 0.6s ease-out',
				'shimmer': 'shimmer 2s infinite',
				'pulse-slow': 'pulse-slow 3s infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'marquee': 'marquee 25s linear infinite',
				'float': 'float 3s ease-in-out infinite',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				serif: ['Playfair Display', 'Georgia', 'serif'],
				mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
			},
			fontWeight: {
				'hairline': '100',
				'thin': '200',
				'light': '300',
				'normal': '400',
				'medium': '500',
				'semibold': '600',
				'bold': '700',
				'extrabold': '800',
				'black': '900',
			},
			letterSpacing: {
				'tightest': '-0.075em',
				'tighter': '-0.05em',
				'tight': '-0.025em',
				'normal': '0em',
				'wide': '0.025em',
				'wider': '0.05em',
				'widest': '0.1em',
			},
			lineHeight: {
				'3': '.75rem',
				'4': '1rem',
				'5': '1.25rem',
				'6': '1.5rem',
				'7': '1.75rem',
				'8': '2rem',
				'9': '2.25rem',
				'10': '2.5rem',
			},
			maxWidth: {
				'8xl': '88rem',
				'9xl': '96rem',
			},
			minHeight: {
				'screen-75': '75vh',
				'screen-50': '50vh',
				'screen-25': '25vh',
			},
			backdropBlur: {
				'xs': '2px',
			},
			boxShadow: {
				'inner-lg': 'inset 0 10px 15px -3px rgb(0 0 0 / 0.1), inset 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				'glow': '0 0 20px rgb(59 130 246 / 0.5)',
				'glow-lg': '0 0 40px rgb(59 130 246 / 0.5)',
			},
			dropShadow: {
				'glow': [
					'0 0px 20px rgba(255,255, 255, 0.35)',
					'0 0px 65px rgba(255, 255,255, 0.2)'
				]
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			transitionDuration: {
				'2000': '2000ms',
				'3000': '3000ms',
				'5000': '5000ms',
			},
			transitionDelay: {
				'2000': '2000ms',
				'3000': '3000ms',
				'5000': '5000ms',
			},
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
			},
			aspectRatio: {
				'4/3': '4 / 3',
				'3/2': '3 / 2',
				'2/3': '2 / 3',
				'9/16': '9 / 16',
			},
		}
	},
	plugins: [
		animate,
		// Add custom plugin for utilities
		function({ addUtilities, theme }: any) {
			const newUtilities = {
				// Glass morphism effects
				'.glass': {
					background: 'rgba(255, 255, 255, 0.25)',
					'backdrop-filter': 'blur(10px)',
					'-webkit-backdrop-filter': 'blur(10px)',
					border: '1px solid rgba(255, 255, 255, 0.18)',
				},
				'.glass-dark': {
					background: 'rgba(0, 0, 0, 0.25)',
					'backdrop-filter': 'blur(10px)',
					'-webkit-backdrop-filter': 'blur(10px)',
					border: '1px solid rgba(255, 255, 255, 0.1)',
				},
				// Smooth transitions for theme switching
				'.theme-transition': {
					transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, fill 0.2s ease, stroke 0.2s ease',
				},
				// Custom scrollbar
				'.scrollbar-thin': {
					'scrollbar-width': 'thin',
				},
				'.scrollbar-thin::-webkit-scrollbar': {
					width: '8px',
					height: '8px',
				},
				'.scrollbar-thin::-webkit-scrollbar-track': {
					'background-color': theme('colors.gray.100'),
				},
				'.dark .scrollbar-thin::-webkit-scrollbar-track': {
					'background-color': theme('colors.gray.800'),
				},
				'.scrollbar-thin::-webkit-scrollbar-thumb': {
					'background-color': theme('colors.gray.300'),
					'border-radius': '4px',
				},
				'.dark .scrollbar-thin::-webkit-scrollbar-thumb': {
					'background-color': theme('colors.gray.600'),
				},
				'.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
					'background-color': theme('colors.gray.400'),
				},
				'.dark .scrollbar-thin::-webkit-scrollbar-thumb:hover': {
					'background-color': theme('colors.gray.500'),
				},
				// Hide scrollbar but keep functionality
				'.scrollbar-hide': {
					'-ms-overflow-style': 'none',
					'scrollbar-width': 'none',
				},
				'.scrollbar-hide::-webkit-scrollbar': {
					display: 'none',
				},
				// Text overflow utilities
				'.text-ellipsis-2': {
					display: '-webkit-box',
					'-webkit-box-orient': 'vertical',
					'-webkit-line-clamp': '2',
					overflow: 'hidden',
				},
				'.text-ellipsis-3': {
					display: '-webkit-box',
					'-webkit-box-orient': 'vertical',
					'-webkit-line-clamp': '3',
					overflow: 'hidden',
				},
				'.text-ellipsis-4': {
					display: '-webkit-box',
					'-webkit-box-orient': 'vertical',
					'-webkit-line-clamp': '4',
					overflow: 'hidden',
				},
			}
			addUtilities(newUtilities)
		}
	],
	// Add safelist for dynamic classes that might be purged
	safelist: [
		'dark',
		'light',
		// Add any dynamic classes that might be generated
		{
			pattern: /^(bg-|text-|border-|ring-)(zuree|gray|red|blue|green|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900|950)$/,
		},
		{
			pattern: /^(animate-|transition-|duration-|delay-|ease-)/,
		},
	],
} satisfies Config;