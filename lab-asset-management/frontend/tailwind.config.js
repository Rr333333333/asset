/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Disable preflight so Tailwind's CSS reset does not fight Material UI.
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
