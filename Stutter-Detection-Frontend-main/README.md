# Stutter Detection - Frontend

This repository contains the frontend for the AI-powered stutter detection system. It provides a user-friendly interface for uploading audio files, viewing analysis results, and interacting with the backend for stutter detection processing.

## Table of Contents

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Interface**: Clean and responsive UI for uploading and analyzing speech.
- **Integration**: Connects seamlessly with the backend for processing.
- **Visualization**: Displays results in an intuitive format.
- **Vite & Tailwind**: Uses Vite for fast development and Tailwind for styling.

## Directory Structure

```
.
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vite.config.js
├── public/
│   ├── vite.svg
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── assets/
│   │   ├── react.svg
│   ├── components/
│   │   ├── AnimatedBackground.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── FloatingLetters.jsx
│   │   ├── GuidedTour.jsx
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ParticleBackground.jsx
│   │   ├── ReadableText.jsx
│   │   ├── SpeechWaveform.jsx
│   │   ├── ui/
│   │   │   ├── accordion.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── select.jsx
│   ├── contexts/
│   │   ├── ThemeContext.jsx
│   ├── data/
│   │   ├── sentences.json
│   ├── lib/
│   │   ├── utils.js
│   ├── pages/
│   │   ├── Analyze.jsx
│   │   ├── Documentation.jsx
│   │   ├── Home.jsx
│   │   ├── Results.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   ├── output.css
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/stutter-detection-frontend.git
   cd stutter-detection-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

2. Build for production:
   ```bash
   npm run build
   ```

3. Preview the production build:
   ```bash
   npm run preview
   ```

## Contributing

Contributions are welcome! Any help is accepted!!

