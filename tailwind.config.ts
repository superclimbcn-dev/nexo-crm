import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1115',
        foreground: '#f8fafc',
        card: '#161920',
        'card-foreground': '#f8fafc',
        primary: '#6366f1',
        'primary-foreground': '#ffffff',
        secondary: '#1c1f26',
        'secondary-foreground': '#94a3b8',
        muted: '#1c1f26',
        'muted-foreground': '#64748b',
        accent: '#8b5cf6',
        'accent-foreground': '#ffffff',
        border: '#1c1f26',
        input: '#1c1f26',
        ring: '#6366f1',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [],
}
export default config
