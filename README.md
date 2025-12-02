# FitGenius AI 🏋️‍♂️🤖

FitGenius AI is a next-generation **Progressive Web App (PWA)** that acts as your intelligent personal trainer. Powered by **Google Gemini**, **OpenAI**, **xAI (Grok)**, or **DeepSeek**, it generates personalized workout plans, provides real-time voice guidance, analyzes your progress, and keeps you motivated with a gamified achievement system.

![App Screenshot](https://placehold.co/800x400?text=FitGenius+AI+Preview)

## ✨ Key Features

*   **🧠 AI-Powered Planning**: Generates structured weekly workout schedules based on your goal (Weight Loss, Muscle Gain), level, and available equipment.
*   **🗣️ Voice Guidance (TTS)**: The app speaks to you during workouts, announcing exercises, countdowns, and rest periods so you don't have to look at the screen.
*   **🏆 Gamification**: Unlock badges like "Early Bird", "Squat Master", and "Consistency King" as you train.
*   **📊 Advanced Analytics**: Track your Weight, Training Volume (Tonnage), and visualize your "Muscle Heatmap" to see which body parts you've trained recently.
*   **🌗 Tech/Dark Mode**: A sleek Cyberpunk-inspired dark theme for low-light gym environments.
*   **💾 Offline Capable**: All data is stored locally on your device (`localStorage`).
*   **🔑 Bring Your Own Key (BYOK)**: Securely use your own API Key from Google, OpenAI, xAI, or DeepSeek.

## 🚀 Getting Started

### Option 1: Live Demo
(Host this on GitHub Pages or Vercel)

### Option 2: Run Locally

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/fitgenius-ai.git
    ```
2.  **Open `index.html`**
    Since this is a client-side PWA using ES Modules, you need a simple HTTP server.
    ```bash
    # If you have Python installed
    python3 -m http.server
    # OR using Node.js http-server
    npx http-server .
    ```
3.  **App Configuration**
    *   Open the app in your browser.
    *   Go to **Settings**.
    *   Enter your **Gemini API Key** (or OpenAI/Grok/DeepSeek key).
    *   Start training!

## 📱 Installing on Mobile (PWA)

**iOS (iPhone/iPad)**:
1.  Open the site in **Safari**.
2.  Tap the **Share** button (box with arrow).
3.  Scroll down and tap **"Add to Home Screen"**.

**Android**:
1.  Open the site in **Chrome**.
2.  Tap the three dots menu.
3.  Tap **"Install App"** or **"Add to Home screen"**.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS
*   **AI Integration**: Google GenAI SDK (Gemini 2.5 Flash), Universal REST Adapter for OpenAI/Grok/DeepSeek
*   **Charts**: Recharts
*   **Icons**: Lucide React
*   **Build**: No build step required (ES Modules via CDN for rapid prototyping)

## 📄 License

MIT License. Free to use and modify.
