// Function to switch between pages
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const activePage = document.getElementById(pageId);
    activePage.classList.add('active');
}

// Initial setup to show Home page by default
showPage('home');

// Array to store previous green scores
let previousScores = [];

// Form submission event to generate Green Score based on form input values
document.getElementById('scoreForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the form input values and convert them to numbers
    const energyEfficient = Number(document.getElementById('energyEfficient').value);
    const wasteManagement = Number(document.getElementById('wasteManagement').value);
    const sustainableMaterials = Number(document.getElementById('sustainableMaterials').value);

    // Calculate the sum of the input values
    const greenScore = energyEfficient + wasteManagement + sustainableMaterials;

    // Display the generated score on the page
    document.getElementById('generatedScore').textContent = `Your Green Score: ${greenScore}`;

    // Store the generated score in the previousScores array
    previousScores.push(greenScore);

    // Update the Dashboard with the new score
    updateDashboard();
});

// Function to update the Dashboard page with previous scores
function updateDashboard() {
    const scoreList = document.getElementById('score-list');
    scoreList.innerHTML = ''; // Clear the list before adding new items

    // Add each score as a list item in the dashboard
    previousScores.forEach((score, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Score ${index + 1}: ${score}`;
        scoreList.appendChild(listItem);
    });
}
