# Quantum Flip - 3D US Coin Simulator

Quantum Flip is a premium, interactive web application that simulates a realistic 3D coin toss using the classic **US Quarter Dollar** design. Built with vanilla HTML5, CSS3, and JavaScript, it integrates Web Audio API synthesis for auditory feedback, custom canvas rendering for particle celebrations, and persistent analytics dashboard tracking.

## 🪙 Preview & Design

The simulator utilizes custom high-fidelity gold US Quarter designs:
- **Heads**: Profile of George Washington with "LIBERTY" and "IN GOD WE TRUST".
- **Tails**: American Bald Eagle with "UNITED STATES OF AMERICA" and "QUARTER DOLLAR".

## ✨ Key Features

- **3D Card Physics**: Fluid X/Y/Z perspective-based CSS spins (`preserve-3d`, `backface-visibility`) mimicking real-world velocity.
- **Audio Synthesizer**: Utilizes the browser's native `AudioContext` to programmatically generate organic click and resonant metallic bell decays upon flipping and landing (completely asset-free!).
- **Confetti Engine**: Interactive 2D canvas particle emitter that bursts multi-colored confetti only when the player correctly predicts the toss outcome.
- **Analytics Dashboard**: Tracks total flips, heads vs. tails ratios, win percentages, and maps ratios on a visual progress bar.
- **Recent Flips Logs**: Shows a rolling history of the 5 most recent flips with timestamp markers and Win/Loss predictions.
- **Persistence**: Employs browser `localStorage` to retain stats and logs across tabs/sessions.

## 📁 File Structure

```
├── index.html       # Application markup & accessibility attributes
├── style.css        # Layout, typography tokens, glassmorphism, 3D animations
├── script.js        # Web Audio API engine, particle systems, app state managers
├── us-heads.jpg     # George Washington US Quarter face (Heads)
├── us-tails.jpg     # American Eagle US Quarter face (Tails)
└── .gitignore       # Exclusions for OS metadata & IDE projects
```

## 🚀 Getting Started

1. Clone or download the repository.
2. Serve the directory using any static file server:
   ```bash
   # Using Node.js
   npx http-server -p 8080
   
   # Using Python 3
   python -m http.server 8080
   ```
3. Open **`http://localhost:8080`** in your browser.
