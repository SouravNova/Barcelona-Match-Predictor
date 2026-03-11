# Barcelona Match Predictor ⚽

![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Football Analytics Project](https://img.shields.io/badge/Project-Football%20Analytics-004D98?style=for-the-badge&logo=fcbarcelona)
![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-A50044?style=for-the-badge)

## Description

A modern, responsive web-based application that predicts match outcomes for FC Barcelona using match statistics and algorithmic scoring. Developed with premium UI features mimicking a professional football app.

## Features

- **Match Prediction System**: Analyzes user input to predict Win/Draw/Loss and calculate a confidence percentage.
- **Interactive UI**: Glassmorphism design with animations to provide a rich user experience.
- **Football-Themed Design**: Uses FC Barcelona's iconic Blaugrana colors.
- **Bonus Scoring**: Accounts for player form (e.g. Lamine Yamal) impacting overall strength.
- **Match History**: Displays a history of recent team matches via JSON fetching.

## Tech Stack

- HTML5
- CSS3 (Vanilla, Variables, Grid/Flexbox)
- JavaScript (ES6+, Async/Await)

## Example Usage

**User Input:**
- Opponent: Atletico Madrid
- Location: Home
- Goals Scored: 10
- Goals Conceded: 4
- Opponent Strength: 8
- Lamine Yamal G/A: 4

**Output:**
- Prediction: Barcelona Win
- Confidence: 72%
- Score Breakdown highlighting advantages and penalties.

## Future Improvements (Version 2)

- [ ] Python ML model integration
- [ ] Dataset expansion to 500+ historical matches
- [ ] Logistic Regression algorithm
- [ ] Live match data fetching via Football APIs (e.g., API-Football)
- [ ] Advanced Player performance analytics (xG, Assists)
