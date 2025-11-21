// Repertoire Preview Loader for Index Page
// Loads random works from CSV files and displays preview cards

// Function to parse CSV line handling quoted fields
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    
    return values;
}

// Function to load CSV file
async function loadCSVFile(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            console.warn(`Failed to load ${filename}`);
            return [];
        }
        
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            return [];
        }
        
        // Parse headers
        const headers = parseCSVLine(lines[0]);
        const works = [];
        
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            
            if (values.length !== headers.length) {
                continue;
            }
            
            const work = {};
            headers.forEach((header, index) => {
                work[header] = values[index] || '';
            });
            
            works.push(work);
        }
        
        return works;
        
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
}

// Function to get random items from array
function getRandomItems(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to create preview card HTML
function createPreviewCard(work, category) {
    // Create a unique ID from the title (lowercase, replace spaces with hyphens, remove special chars)
    const workId = work.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    
    return `
        <a href="classical-repertoire.html#${category}-${workId}" class="repertoire-preview-card">
            <div class="repertoire-preview-image">
                <img src="${work.pdfPreview}" alt="${work.title}" title="${work.title} - Score Preview" loading="lazy" width="400" height="566" onerror="this.src='images/scores/default-preview.jpg'">
            </div>
            <div class="repertoire-preview-content">
                <h3>${work.title}</h3>
                <p class="instrumentation">${work.instrumentation}</p>
                <p class="duration">${work.duration}</p>
            </div>
        </a>
    `;
}

// Function to load and display preview
async function loadRepertoirePreview() {
    const container = document.getElementById('repertoirePreviewGrid');
    if (!container) return;
    
    try {
        // Load both CSV files
        const [compositions, arrangements] = await Promise.all([
            loadCSVFile('data/compositions.csv'),
            loadCSVFile('data/arrangements.csv')
        ]);
        
        // Tag works with their category
        const taggedCompositions = compositions.map(w => ({...w, category: 'compositions'}));
        const taggedArrangements = arrangements.map(w => ({...w, category: 'arrangements'}));
        
        // Combine all works
        const allWorks = [...taggedCompositions, ...taggedArrangements];
        
        if (allWorks.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No works available</p>';
            return;
        }
        
        // Get 5 random works
        const previewCount = Math.min(5, allWorks.length);
        const randomWorks = getRandomItems(allWorks, previewCount);
        
        // Generate and insert cards
        const cardsHTML = randomWorks.map(work => createPreviewCard(work, work.category)).join('');
        container.innerHTML = cardsHTML;
        
    } catch (error) {
        console.error('Error loading repertoire preview:', error);
        container.innerHTML = '<p style="text-align: center; color: #999;">Unable to load preview</p>';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRepertoirePreview);
} else {
    loadRepertoirePreview();
}
