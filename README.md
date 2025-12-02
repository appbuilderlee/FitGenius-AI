# FitGenius AI 🏋️‍♂️🤖

FitGenius AI is a next-generation **Progressive Web App (PWA)** that acts as your intelligent personal trainer.

![App Preview](https://placehold.co/800x400?text=FitGenius+AI)

## 🚀 How to Deploy to GitHub Pages

Since this app uses **TypeScript** and **React**, browsers cannot run the code directly. You must "build" it first.

### Step 1: Install & Build
1.  Make sure you have [Node.js](https://nodejs.org/) installed.
2.  Open your terminal/command prompt in the project folder.
3.  Run:
    ```bash
    npm install
    npm run build
    ```
4.  This will create a new folder called **`dist`**.

### Step 2: Upload to GitHub
1.  **Easiest Method**: Open the `dist` folder, select all files inside it (index.html, assets folder, etc.), and drag-and-drop them into your GitHub Repository upload page (root directory).
2.  **Professional Method**: Use `gh-pages` package or GitHub Actions to deploy the `dist` folder automatically.

### Step 3: Enable PWA on Mobile
1.  Visit your GitHub Pages URL (e.g., `your.github.io/fitgenius`).
2.  **iOS**: Tap Share -> "Add to Home Screen".
3.  **Android**: Tap Menu -> "Install App".

## ✨ Features
*   **AI Planning**: Custom workouts via Gemini/OpenAI/Grok.
*   **Voice Guide**: TTS support.
*   **Tech Mode**: Dark theme.
*   **BYOK**: Bring Your Own Key architecture.

## 🛠️ Tech Stack
*   React + TypeScript
*   Vite (Builder)
*   Tailwind CSS
*   Google GenAI SDK