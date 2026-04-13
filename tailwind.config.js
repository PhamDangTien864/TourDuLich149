/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Đưa font Be Vietnam Pro làm font sans mặc định
        sans: ["var(--font-be-vietnam)", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
}