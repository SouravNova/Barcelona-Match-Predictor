// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadMatchHistory();
    initGodLevelEffects();
});

// God-Level UI Effects Logic
function initGodLevelEffects() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to the card setup for CSS lighting variable
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // 3D Tilt Effect
            // Calculate rotation centered around 0 (midpoint of card)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Limit the maximum rotation to a subtle amount (e.g. 3 degrees)
            const rotateX = ((y - centerY) / centerY) * -3; 
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        // Reset transform smoothly when mouse leaves
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            card.style.transition = `transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)`;
        });

        // Remove the transition delay when re-entering to make tracking instantaneous
        card.addEventListener('mouseenter', () => {
            card.style.transition = `transform 0.1s ease-out`;
        });
    });
}

// Main prediction function
function predictMatch() {
    // 1. Gather inputs
    const opponent = document.getElementById("opponent").value;
    const location = document.getElementById("location").value;
    const goalsScored = parseInt(document.getElementById("goalsScored").value) || 0;
    const goalsConceded = parseInt(document.getElementById("goalsConceded").value) || 0;
    const opponentStrength = parseInt(document.getElementById("opponentStrength").value) || 5;
    const yamalGA = parseInt(document.getElementById("yamalGA").value) || 0;

    // 2. Algorithm Scoring
    // Normalized form score (Average goals per game diff over last 5)
    const formScore = (goalsScored - goalsConceded) / 5;
    const homeAdvantage = location === "home" ? 1.5 : 0;
    
    // Feature: Lamine Yamal impact
    const yamalBonus = yamalGA >= 3 ? 1 : (yamalGA >= 1 ? 0.5 : 0);

    // Feature: Clean Sheet Bonus
    const cleanSheetBonus = goalsConceded === 0 ? 0.5 : 0;

    const totalScore = formScore + homeAdvantage - (opponentStrength / 2) + yamalBonus + cleanSheetBonus;

    // 3. Determine Outcome
    let prediction, themeClass;
    
    if (totalScore > 1) {
        prediction = "Barcelona Win";
        themeClass = "theme-win";
    } else if (totalScore >= -0.5) {
        prediction = "Draw";
        themeClass = "theme-draw";
    } else {
        prediction = "Loss";
        themeClass = "theme-loss";
    }

    // 4. Calculate Confidence
    // Base 50% + factor of score magnitude
    let confidence = Math.min(98, Math.floor(Math.abs(totalScore) * 15 + 60));
    
    if (prediction === "Draw") {
        confidence = Math.min(70, confidence);
    }

    // 5. Update UI
    displayResult(prediction, confidence, themeClass, {
        formScore: formScore.toFixed(1),
        homeAdvantage,
        opponentStrength: (opponentStrength / 2).toFixed(1),
        yamalBonus,
        cleanSheetBonus,
        totalScore: totalScore.toFixed(1)
    });
}

function displayResult(prediction, confidence, themeClass, breakdown) {
    const placeholder = document.getElementById("resultPlaceholder");
    const content = document.getElementById("resultContent");
    const resultSection = document.getElementById("resultSection");
    
    // Hide placeholder, show content
    placeholder.classList.add("hidden");
    content.classList.remove("hidden");
    
    // Reset and apply theme
    resultSection.classList.remove("theme-win", "theme-draw", "theme-loss");
    resultSection.classList.add(themeClass);
    
    // Set text
    document.getElementById("predictionBadge").textContent = prediction;
    
    // Animate confidence bar
    const fill = document.getElementById("confidenceFill");
    const confValue = document.getElementById("confidenceValue");
    
    fill.style.width = "0%";
    confValue.textContent = "0%";
    
    setTimeout(() => {
        fill.style.width = `${confidence}%`;
        
        // Counter animation for text
        let start = 0;
        const duration = 1000;
        const increment = confidence / (duration / 16);
        
        function updateCounter() {
            start += increment;
            if (start < confidence) {
                confValue.textContent = `${Math.floor(start)}%`;
                requestAnimationFrame(updateCounter);
            } else {
                confValue.textContent = `${confidence}%`;
            }
        }
        requestAnimationFrame(updateCounter);
    }, 50);

    // Populate score breakdown
    const breakdownList = document.getElementById("scoreDetails");
    breakdownList.innerHTML = `
        <li><span>Form Index (Avg G-Diff)</span> <span>${breakdown.formScore > 0 ? '+' : ''}${breakdown.formScore}</span></li>
        <li><span>Home Advantage</span> <span>+${breakdown.homeAdvantage}</span></li>
        <li><span>Opponent Penalty</span> <span>-${breakdown.opponentStrength}</span></li>
        ${breakdown.yamalBonus > 0 ? `<li><span>Yamal G/A Bonus</span> <span>+${breakdown.yamalBonus}</span></li>` : ''}
        ${breakdown.cleanSheetBonus > 0 ? `<li><span>Clean Sheet Bonus</span> <span>+${breakdown.cleanSheetBonus}</span></li>` : ''}
        <li style="font-weight: bold; margin-top: 5px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px;">
            <span>Final Algorithmic Index</span> <span>${breakdown.totalScore}</span>
        </li>
    `;
    
    // Add small bump animation to card
    resultSection.style.transform = "scale(1.02)";
    setTimeout(() => {
        resultSection.style.transform = "scale(1)";
        resultSection.style.transition = "transform 0.3s ease";
    }, 200);
}

// Fetch and display match history from live API (TheSportsDB)
async function loadMatchHistory() {
    const list = document.getElementById("matchHistoryList");
    list.innerHTML = "<li><span class='pulse-icon'>⏳</span> Fetching latest live data...</li>";

    try {
        // TheSportsDB Team ID for FC Barcelona is 133739
        // Endpoint: Last 5 events by Team Id
        const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=133739');
        
        if (!response.ok) throw new Error("Failed to load live data");
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error("No recent matches found in live API");
        }

        list.innerHTML = "";
        
        // Take up to 5 most recent matches
        const recentMatches = data.results.slice(0, 5);

        recentMatches.forEach(match => {
            // Determine Win, Loss, or Draw from perspective of FC Barcelona
            const isHome = match.idHomeTeam === "133739";
            const barcaScore = parseInt(isHome ? match.intHomeScore : match.intAwayScore);
            const opponentScore = parseInt(isHome ? match.intAwayScore : match.intHomeScore);
            const opponentName = isHome ? match.strAwayTeam : match.strHomeTeam;
            
            let resultClass = "draw";
            if (barcaScore > opponentScore) resultClass = "win";
            if (barcaScore < opponentScore) resultClass = "loss";

            const li = document.createElement("li");
            li.className = `match-item ${resultClass}`;
            li.innerHTML = `
                <div class="match-info">
                    <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">${match.strLeague} - ${match.dateEvent}</span>
                    FC Barcelona vs ${opponentName}
                </div>
                <div class="match-score">${match.intHomeScore} - ${match.intAwayScore}</div>
            `;
            list.appendChild(li);
        });

    } catch (error) {
        console.warn("Live API failed or is outdated, falling back to local matches.json.", error);
        
        try {
            const fallbackResponse = await fetch('matches.json');
            if (!fallbackResponse.ok) throw new Error("Local fallback failed");
            const fallbackData = await fallbackResponse.json();
            
            list.innerHTML = "";
            fallbackData.matches.slice(0, 5).forEach(match => {
                const li = document.createElement("li");
                li.className = `match-item ${match.result.toLowerCase()}`;
                li.innerHTML = `
                    <div class="match-info">
                        <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">${match.competition} (${match.date})</span>
                        FCB vs ${match.opponent}
                    </div>
                    <div class="match-score">${match.score}</div>
                `;
                list.appendChild(li);
            });
        } catch (fallbackError) {
            console.error("Critical: All data sources failed.", fallbackError);
            list.innerHTML = "<li><span class='pulse-icon'>❌</span> Unable to load match history. Please check connection.</li>";
        }
    }
}
