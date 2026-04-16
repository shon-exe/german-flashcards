let allCards = []; 
let filteredCards = []; 
let currentIndex = 0;

document.getElementById('excel-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

        allCards = [];
        let startRow = rows.findIndex(row => row && (row.includes("word") || row.includes("phrase")));
        if (startRow === -1) startRow = 1;

        for (let i = startRow + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row) continue;
            if (row[0]) allCards.push({ word: row[0], translation: row[3], info: `Gender: ${row[1] || '-'} | Class: ${row[2] || '-'}`, type: 'Noun' });
            if (row[5]) allCards.push({ word: row[5], translation: row[6], info: 'Adjective', type: 'Adjective' });
            if (row[8]) allCards.push({ word: row[8], translation: row[10], info: `Verb Class: ${row[9] || '-'}`, type: 'Verb' });
            if (row[12]) allCards.push({ word: row[12], translation: row[13], info: 'Adverb', type: 'Adverb' });
            if (row[15]) allCards.push({ word: row[15], translation: row[16], info: 'Other', type: 'Other' });
            if (row[18]) allCards.push({ word: row[18], translation: row[19], info: 'Phrase', type: 'Phrase' });
        }
        filterCards(); 
    };
    reader.readAsArrayBuffer(file);
});

function filterCards() {
    const type = document.getElementById('category-select').value;
    filteredCards = (type === "All") ? [...allCards] : allCards.filter(c => c.type === type);
    currentIndex = 0;
    if (filteredCards.length > 0) showCard(0);
}

function showCard(index) {
    const card = filteredCards[index];
    document.getElementById('front').innerText = card.word;
    document.getElementById('flashcard').classList.remove('is-flipped');
    
    // Hide details panel for the new card
    document.getElementById('details-panel').style.visibility = 'hidden';
    
    // Update Progress
    const total = filteredCards.length;
    const progress = ((index + 1) / total) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').innerText = `${index + 1} / ${total} Words`;

    // Prepare info content
    document.getElementById('extra-info').innerHTML = `
        <div class="translation-text">${card.translation || '...'}</div>
        <div style="color:#888; font-size:0.9rem;">Type: ${card.type} | ${card.info}</div>
    `;
}

// Button Listeners
document.getElementById('reveal-btn').addEventListener('click', () => {
    document.getElementById('details-panel').style.visibility = 'visible';
});

document.getElementById('shuffle-btn').addEventListener('click', () => {
    for (let i = filteredCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filteredCards[i], filteredCards[j]] = [filteredCards[j], filteredCards[i]];
    }
    currentIndex = 0;
    showCard(0);
});

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentIndex < filteredCards.length - 1) { currentIndex++; showCard(currentIndex); }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; showCard(currentIndex); }
});

document.getElementById('flashcard').addEventListener('click', function() { this.classList.toggle('is-flipped'); });
document.getElementById('category-select').addEventListener('change', filterCards);
