// CSV-based Works Loader for GitHub Pages
// Reads works data from compositions.csv and arrangements.csv files

// Function to parse entire CSV handling multi-line quoted fields
function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                currentField += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ';' && !inQuotes) {
            // Field separator
            currentRow.push(currentField.trim());
            currentField = '';
        } else if (char === '\n' && !inQuotes) {
            // Row separator
            currentRow.push(currentField.trim());
            if (currentRow.some(field => field !== '')) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
        } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
            // Windows line ending
            currentRow.push(currentField.trim());
            if (currentRow.some(field => field !== '')) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentField = '';
            i++; // Skip \n
        } else {
            currentField += char;
        }
    }
    
    // Push last field and row
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field !== '')) {
            rows.push(currentRow);
        }
    }
    
    return rows;
}

// Function to load and parse a single CSV file
async function loadCSVFile(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        if (rows.length < 2) {
            console.warn(`${filename} is empty or has no data rows`);
            return [];
        }
        
        // Parse headers
        const headers = rows[0];
        const works = [];
        
        // Parse data rows
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];
            
            if (values.length !== headers.length) {
                console.warn(`${filename} line ${i + 1} has incorrect number of columns, skipping`);
                continue;
            }
            
            const work = {};
            headers.forEach((header, index) => {
                let value = values[index] || '';
                // Convert line breaks to <br> tags for program notes
                if (header === 'programNotes' && value) {
                    value = value.replace(/\n/g, '<br>');
                }
                work[header] = value;
            });
            
            works.push(work);
        }
        
        return works;
        
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return [];
    }
}

// Function to load both CSV files
async function loadWorksFromCSV() {
    try {
        const [compositions, arrangements] = await Promise.all([
            loadCSVFile('compositions.csv'),
            loadCSVFile('arrangements.csv')
        ]);
        
        const works = {
            compositions: compositions,
            arrangements: arrangements
        };
        
        console.log('Loaded works:', works);
        return works;
        
    } catch (error) {
        console.error('Error loading CSV files:', error);
        return { compositions: [], arrangements: [] };
    }
}

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    if (!url) return null;
    
    // Match various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// Function to check if URL is a SoundCloud link
function isSoundCloudUrl(url) {
    if (!url) return false;
    return url.includes('soundcloud.com');
}

// Function to validate if storeLink is valid (contains 'www')
function hasValidStoreLink(link) {
    if (!link) return false;
    const clean = link.trim();
    if (!clean || clean === '#' || clean === '') return false;
    // Check if the link contains 'www' (case-insensitive)
    return /\bwww\./i.test(clean);
}

// Function to generate media player (audio, YouTube video, or SoundCloud)
function generateMediaPlayer(mediaUrl) {
    if (!mediaUrl) {
        return '';
    }
    
    // Check if it's a YouTube URL
    const youtubeId = getYouTubeVideoId(mediaUrl);
    
    if (youtubeId) {
        // Generate YouTube embed
        return `
            <div class="video-player">
                <iframe 
                    width="100%" 
                    height="315" 
                    src="https://www.youtube.com/embed/${youtubeId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        `;
    } else if (isSoundCloudUrl(mediaUrl)) {
        // Generate SoundCloud embed
        // Encode the URL for the SoundCloud widget API
        const encodedUrl = encodeURIComponent(mediaUrl);
        return `
            <div class="soundcloud-player">
                <iframe 
                    width="100%" 
                    height="166" 
                    scrolling="no" 
                    frameborder="no" 
                    allow="autoplay" 
                    src="https://w.soundcloud.com/player/?url=${encodedUrl}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false">
                </iframe>
            </div>
        `;
    } else {
        // Generate audio player
        return `
            <div class="audio-player">
                <audio controls>
                    <source src="${mediaUrl}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
        `;
    }
}

// Function to generate work card HTML
function generateWorkCard(work) {
    // Build additional info HTML if fields are provided
    let additionalInfo = '';
    
    if (work.premiereDate || work.premiereLocation) {
        additionalInfo += '<div class="work-premiere">';
        if (work.premiereDate && work.premiereLocation) {
            additionalInfo += `<p><strong><span data-translate="repertoire.premiere">World Premiere</span>:</strong> ${work.premiereDate}, ${work.premiereLocation}</p>`;
        } else if (work.premiereDate) {
            additionalInfo += `<p><strong><span data-translate="repertoire.premiere">World Premiere</span>:</strong> ${work.premiereDate}</p>`;
        } else if (work.premiereLocation) {
            additionalInfo += `<p><strong><span data-translate="repertoire.premieredAt">Premiered at</span>:</strong> ${work.premiereLocation}</p>`;
        }
        additionalInfo += '</div>';
    }
    
    if (work.ensemble) {
        additionalInfo += `<div class="work-ensemble"><p><strong><span data-translate="repertoire.performedBy">Performed by</span>:</strong> ${work.ensemble}</p></div>`;
    }
    
    if (work.commissioner) {
        additionalInfo += `<div class="work-commissioner"><p><strong>${work.commissioner}</strong></p></div>`;
    }
    
    if (work.dedication) {
        additionalInfo += `<div class="work-dedication"><p><em>${work.dedication}</em></p></div>`;
    }
    
    if (work.awards) {
        additionalInfo += `<div class="work-awards"><p><strong>🏆 ${work.awards}</strong></p></div>`;
    }
    
    // Create a unique ID from the title
    const workId = work.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    
    // Only include purchase button if storeLink contains 'www'
    const purchaseButtonHTML = hasValidStoreLink(work.storeLink) 
        ? `<a href="${work.storeLink}" class="store-link" target="_blank" data-translate="repertoire.purchaseScore">Purchase Score</a>`
        : '';
    
    // Include artist name if available (for arrangements)
    const artistHTML = work.artist ? `<p class="work-artist">${work.artist}</p>` : '';
    
    return `
        <div class="work-card" id="work-${workId}">
            <div class="work-header">
                <div class="work-header-info">
                    <h3>${work.title}</h3>
                    <p>${work.instrumentation} · ${work.duration}</p>
                </div>
                <span class="expand-icon">▼</span>
            </div>
            <div class="work-content">
                <div class="work-content-inner">
                    <div class="work-info">
                        <h3 class="work-title">${work.title}</h3>
                        ${artistHTML}
                        <p class="work-instrumentation">${work.instrumentation}</p>
                        <p class="work-duration"><span data-translate="repertoire.duration">Duration</span>: ${work.duration}</p>
                        ${additionalInfo}
                        <div class="work-notes">
                            <p><strong><span data-translate="repertoire.programNotes">Program Notes</span>:</strong></p>
                            <div class="program-notes-content">${work.programNotes}</div>
                        </div>
                        ${generateMediaPlayer(work.audioFile)}
                    </div>
                    <div class="work-preview">
                        <div class="pdf-preview" onclick="openLightbox('${work.pdfPreview}', '${work.title.replace(/'/g, "\\'")}')">
                            <img src="${work.pdfPreview}" alt="Score preview">
                        </div>
                        ${purchaseButtonHTML}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to group works by instrumentation type
function groupWorksByInstrumentation(works) {
    const grouped = {};
    works.forEach(work => {
        if (!grouped[work.instrumentationType]) {
            grouped[work.instrumentationType] = [];
        }
        grouped[work.instrumentationType].push(work);
    });
    return grouped;
}

// Function to populate works on page load
async function populateWorks() {
    // Load works from CSV
    const worksData = await loadWorksFromCSV();
    
    // Populate compositions
    const compositionsContainer = document.querySelector('#compositionsSection .works-container');
    if (compositionsContainer) {
        const groupedCompositions = groupWorksByInstrumentation(worksData.compositions);
        let compositionsHTML = '';
        
        for (const [instrumentationType, works] of Object.entries(groupedCompositions)) {
            compositionsHTML += `<h3 class="instrumentation-header">${instrumentationType}</h3>`;
            works.forEach(work => {
                compositionsHTML += generateWorkCard(work);
            });
        }
        
        compositionsContainer.innerHTML = compositionsHTML;
    }
    
    // Populate arrangements
    const arrangementsContainer = document.querySelector('#arrangementsSection .works-container');
    if (arrangementsContainer) {
        const groupedArrangements = groupWorksByInstrumentation(worksData.arrangements);
        let arrangementsHTML = '';
        
        for (const [instrumentationType, works] of Object.entries(groupedArrangements)) {
            arrangementsHTML += `<h3 class="instrumentation-header">${instrumentationType}</h3>`;
            works.forEach(work => {
                arrangementsHTML += generateWorkCard(work);
            });
        }
        
        arrangementsContainer.innerHTML = arrangementsHTML;
    }
    
    // Reinitialize accordion functionality after populating
    initializeAccordion();
    
    // Update translations if translation system is available
    if (typeof updatePageContent === 'function') {
        updatePageContent();
    }
}

// Function to initialize accordion functionality
function initializeAccordion() {
    const workHeaders = document.querySelectorAll('.work-header');
    
    workHeaders.forEach(header => {
        // Remove existing listeners by cloning
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });
    
    // Add new listeners
    document.querySelectorAll('.work-header').forEach(header => {
        header.addEventListener('click', function() {
            const card = this.closest('.work-card');
            const allCards = document.querySelectorAll('.work-card');
            
            // Close all other cards
            allCards.forEach(otherCard => {
                if (otherCard !== card && otherCard.classList.contains('active')) {
                    otherCard.classList.remove('active');
                }
            });
            
            // Toggle current card
            const wasActive = card.classList.contains('active');
            card.classList.toggle('active');
            
            // If card was just opened, scroll to the top of the card with margin
            if (!wasActive) {
                setTimeout(() => {
                    const cardTop = card.getBoundingClientRect().top + window.pageYOffset;
                    const offset = 100; // pixels of space above the card
                    window.scrollTo({
                        top: cardTop - offset,
                        behavior: 'smooth'
                    });
                }, 200); // Wait for expand animation to start
            }
        });
    });
}

// Function to handle hash navigation from preview links
function handleHashNavigation() {
    const hash = window.location.hash;
    if (!hash) return;
    
    // Check if hash is in format: #compositions-work-id or #arrangements-work-id
    const match = hash.match(/^#(compositions|arrangements)-(.+)$/);
    if (!match) return;
    
    const [, category, workId] = match;
    
    // Show the appropriate section
    const categorySection = document.getElementById(category + 'Section');
    const otherCategory = category === 'compositions' ? 'arrangements' : 'compositions';
    const otherSection = document.getElementById(otherCategory + 'Section');
    
    if (categorySection) {
        // Hide the buttons grid
        const buttonsGrid = document.querySelector('.repertoire-grid');
        const backButton = document.querySelector('.back-to-buttons');
        const contentDiv = document.querySelector('.repertoire-content');
        
        if (buttonsGrid) buttonsGrid.style.display = 'none';
        if (backButton) backButton.style.display = 'flex';
        if (contentDiv) contentDiv.style.display = 'block';
        
        // Show the correct category section
        categorySection.style.display = 'block';
        if (otherSection) otherSection.style.display = 'none';
        
        // Find and open the specific work card
        setTimeout(() => {
            const workCard = document.getElementById('work-' + workId);
            if (workCard) {
                workCard.classList.add('active');
                workCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        populateWorks().then(() => {
            handleHashNavigation();
            initializeLightbox();
        });
    });
} else {
    populateWorks().then(() => {
        handleHashNavigation();
        initializeLightbox();
    });
}

// Lightbox functionality for PDF previews
function initializeLightbox() {
    // Create lightbox HTML if it doesn't exist
    if (!document.getElementById('imageLightbox')) {
        const lightboxHTML = `
            <div id="imageLightbox" class="lightbox">
                <span class="lightbox-close">&times;</span>
                <img class="lightbox-content" id="lightboxImage">
                <div class="lightbox-caption" id="lightboxCaption"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        
        // Close lightbox on X click
        document.querySelector('.lightbox-close').onclick = closeLightbox;
        
        // Close lightbox on background click
        document.getElementById('imageLightbox').onclick = function(e) {
            if (e.target.id === 'imageLightbox') {
                closeLightbox();
            }
        };
        
        // Close lightbox on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }
}

function openLightbox(imageSrc, title) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    
    lightbox.style.display = 'flex';
    lightboxImg.src = imageSrc;
    caption.textContent = title;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeLightbox() {
    const lightbox = document.getElementById('imageLightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}
