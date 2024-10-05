// Global variables
let currentUser = null;
let gauge = null;

// Function to switch between pages
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const activePage = document.getElementById(pageId);
    activePage.classList.add('active');

    if (pageId === 'dashboard') {
        updateDashboard();
    }
}

// Initial setup
showPage('home');
initGauge();

// Login functionality
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.getElementsByClassName('close')[0];

loginBtn.onclick = function() {
    loginModal.style.display = 'block';
}

closeBtn.onclick = function() {
    loginModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    // In a real application, you would validate the credentials against a server
    // For this example, we'll just set the current user
    currentUser = username;
    document.getElementById('username').textContent = username;
    document.getElementById('userAvatar').style.display = 'block';
    loginBtn.style.display = 'none';
    loginModal.style.display = 'none';
    loadUserScores();
});

// Form submission event to generate Green Score
document.getElementById('scoreForm').addEventListener('submit', function(event) {
    event.preventDefault();
    showScoreAnimation();
    setTimeout(calculateGreenScore, 2000); // Simulate calculation time
});

// Function to show score animation
function showScoreAnimation() {
    document.getElementById('scoreAnimation').style.display = 'block';
    document.getElementById('scoreResult').style.display = 'none';
}

// Function to calculate Green Score
function calculateGreenScore() {
    // Retrieve values from the form
    const vehicles = parseFloat(document.getElementById("vehicles").value);
    const power = parseFloat(document.getElementById("power").value);
    const waste = parseFloat(document.getElementById("waste").value);
    const recycled = parseFloat(document.getElementById("recycled").value);
    const employees = parseFloat(document.getElementById("employees").value);

    // Normalize per employee
    const vehiclesPerPerson = vehicles / employees;
    const powerPerPerson = power / employees;
    const wastePerPerson = waste / employees;
    const recyclingEfficiency = waste > 0 ? recycled / waste : 0;

    // Average benchmark values
    const avgVehiclesPerPerson = 0.005;
    const avgPowerPerPerson = 100;
    const avgWastePerPerson = 20;
    const avgRecyclingEfficiency = 0.6;

    // Scoring functions based on comparison with averages
    function scoreVehicles(x) {
        return Math.max(0, 100 - (x / avgVehiclesPerPerson) * 20);
    }
    function scorePower(x) {
        return Math.max(0, 100 - (x / avgPowerPerPerson) * 50);
    }
    function scoreWaste(x) {
        return Math.max(0, 100 - (x / avgWastePerPerson) * 50);
    }
    function scoreRecycling(x) {
        return Math.min(100, (x / avgRecyclingEfficiency) * 100);
    }

    // Calculate scores
    const vehicleScore = scoreVehicles(vehiclesPerPerson);
    const powerScore = scorePower(powerPerPerson);
    const wasteScore = scoreWaste(wastePerPerson);
    const recyclingScore = scoreRecycling(recyclingEfficiency);

    // Weighted final score
    const finalScore = (0.2 * vehicleScore + 0.3 * powerScore +
                        0.2 * wasteScore + 0.3 * recyclingScore).toFixed(2);

    // Hide animation and show result
    document.getElementById('scoreAnimation').style.display = 'none';
    document.getElementById('scoreResult').style.display = 'block';

    // Display the result with animation
    const scoreDisplay = document.getElementById("greenScoreDisplay");
    scoreDisplay.textContent = '0.00';
    animateScore(0, parseFloat(finalScore), 1000, scoreDisplay);

    if (currentUser) {
        saveScore(finalScore);
    } else {
        alert('Please log in to save your score.');
    }

    updateGauge(finalScore);
    document.getElementById('scoreForm').reset();
}

// Function to animate score counting
function animateScore(start, end, duration, element) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = (progress * (end - start) + start).toFixed(2);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Function to save score
function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem(currentUser)) || [];
    scores.push({
        score: score,
        date: new Date().toISOString()
    });
    localStorage.setItem(currentUser, JSON.stringify(scores));
    updateDashboard();
}

// Function to load user scores
function loadUserScores() {
    let scores = JSON.parse(localStorage.getItem(currentUser)) || [];
    updateDashboard(scores);
}

// Function to update the Dashboard
function updateDashboard() {
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = '';

    if (!currentUser) {
        scoreList.innerHTML = '<li>Please log in to view your scores.</li>';
        return;
    }

    let scores = JSON.parse(localStorage.getItem(currentUser)) || [];

    scores.forEach((scoreObj, index) => {
        const listItem = document.createElement('li');
        const scoreText = document.createElement('span');
        scoreText.textContent = `Score ${index + 1}: ${scoreObj.score} (${new Date(scoreObj.date).toLocaleDateString()})`;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'score-actions';

        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = 'Details';
        detailsBtn.onclick = () => showScoreDetails(scoreObj);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteScore(index);

        actionsDiv.appendChild(detailsBtn);
        actionsDiv.appendChild(deleteBtn);

        listItem.appendChild(scoreText);
        listItem.appendChild(actionsDiv);
        scoreList.appendChild(listItem);
    });

    if (scores.length > 0) {
        updateGauge(scores[scores.length - 1].score);
    } else {
        updateGauge(0);
    }
}

// Function to show score details
function showScoreDetails(scoreObj) {
    alert(`Score: ${scoreObj.score}\nDate: ${new Date(scoreObj.date).toLocaleString()}`);
}

// Function to delete a score
function deleteScore(index) {
    let scores = JSON.parse(localStorage.getItem(currentUser)) || [];
    scores.splice(index, 1);
    localStorage.setItem(currentUser, JSON.stringify(scores));
    updateDashboard();
}

// Function to initialize the gauge
function initGauge() {
    const opts = {
        angle: 0.15,
        lineWidth: 0.44,
        radiusScale: 1,
        pointer: {
            length: 0.6,
            strokeWidth: 0.035,
            color: '#000000'
        },
        limitMax: false,
        limitMin: false,
        colorStart: '#6FADCF',
        colorStop: '#8FC0DA',
        strokeColor: '#E0E0E0',
        generateGradient: true,
        highDpiSupport: true,
    };
    const target = document.getElementById('scoreGauge');
    gauge = new Gauge(target).setOptions(opts);
    gauge.maxValue = 100;
    gauge.setMinValue(0);
    gauge.animationSpeed = 32;
    gauge.set(0);
}

// Function to update the gauge
function updateGauge(score) {
    if (gauge) {
        gauge.set(parseFloat(score));
    }
}

// Load user scores on page load
if (currentUser) {
    loadUserScores();
}