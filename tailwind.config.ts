
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
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
					foreground: 'hsl(var(--primary-foreground))'
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
				// Gen Z Color Palette
				'gen-z': {
					electric: 'hsl(var(--gen-z-electric))',
					'neon-pink': 'hsl(var(--gen-z-neon-pink))',
					'cyber-yellow': 'hsl(var(--gen-z-cyber-yellow))',
					mint: 'hsl(var(--gen-z-mint))',
					coral: 'hsl(var(--gen-z-coral))',
					lavender: 'hsl(var(--gen-z-lavender))',
					sage: 'hsl(var(--gen-z-sage))',
					sunset: 'hsl(var(--gen-z-sunset))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'neon-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(var(--gen-z-electric) / 0.5)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 40px hsl(var(--gen-z-electric) / 0.8)',
						transform: 'scale(1.02)'
					}
				},
				'rainbow-shift': {
					'0%': { filter: 'hue-rotate(0deg)' },
					'100%': { filter: 'hue-rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
				'enter': 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
				'exit': 'fade-out 0.3s ease-out, scale-out 0.2s ease-out',
				'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
				'rainbow-shift': 'rainbow-shift 3s linear infinite'
			},
			fontFamily: {
				'display': ['Inter', 'system-ui', 'sans-serif'],
				'heading': ['Inter', 'system-ui', 'sans-serif']
			},
			backgroundImage: {
				'gen-z-electric': 'linear-gradient(135deg, hsl(var(--gen-z-electric)), hsl(var(--gen-z-neon-pink)))',
				'gen-z-sunset': 'linear-gradient(135deg, hsl(var(--gen-z-sunset)), hsl(var(--gen-z-cyber-yellow)))',
				'gen-z-mint': 'linear-gradient(135deg, hsl(var(--gen-z-mint)), hsl(var(--gen-z-sage)))',
				'gen-z-lavender': 'linear-gradient(135deg, hsl(var(--gen-z-lavender)), hsl(var(--gen-z-electric)))'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
