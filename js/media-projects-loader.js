// Media Projects CSV Loader
// Loads and displays media projects from media-projects.csv

// Function to parse CSV handling multi-line quoted fields
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

// Function to load and parse media projects CSV
async function loadMediaProjectsCSV() {
    try {
        const response = await fetch('data/media-projects.csv');
        if (!response.ok) {
            throw new Error('Failed to load media-projects.csv');
        }
        
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        
        if (rows.length < 2) {
            console.warn('media-projects.csv is empty or has no data rows');
            return [];
        }
        
        // Parse headers
        const headers = rows[0];
        const projects = [];
        
        // Parse data rows
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i];
            
            if (values.length !== headers.length) {
                console.warn(`media-projects.csv line ${i + 1} has incorrect number of columns, skipping`);
                continue;
            }
            
            const project = {};
            headers.forEach((header, index) => {
                let value = values[index] || '';
                // Convert line breaks to <br> tags for description
                if (header === 'description' && value) {
                    value = value.replace(/\n/g, '<br>');
                }
                project[header] = value;
            });
            
            // Only add projects with title
            if (project.title && project.title.trim()) {
                projects.push(project);
            }
        }
        
        return projects;
        
    } catch (error) {
        console.error('Error loading media-projects.csv:', error);
        return [];
    }
}

// Function to extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    if (!url) return null;
    
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

// Function to check if URL is a Spotify embed
function isSpotifyEmbed(url) {
    if (!url) return false;
    return url.includes('spotify.com/embed');
}

// Function to generate media embed (Spotify, YouTube, or SoundCloud)
function generateMediaEmbed(embedUrl) {
    if (!embedUrl || embedUrl.trim() === '') {
        return '';
    }
    
    // Check if it's a Spotify embed URL
    if (isSpotifyEmbed(embedUrl)) {
        return `
            <iframe style="border-radius:12px" 
                src="${embedUrl}" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
            </iframe>
        `;
    }
    
    // Check if it's a YouTube URL
    const youtubeId = getYouTubeVideoId(embedUrl);
    if (youtubeId) {
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
    }
    
    // Check if it's a SoundCloud link
    if (isSoundCloudUrl(embedUrl)) {
        const encodedUrl = encodeURIComponent(embedUrl);
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
    }
    
    // If it's already an iframe embed code, return as is
    if (embedUrl.includes('<iframe')) {
        return embedUrl;
    }
    
    return '';
}

// Function to generate project card HTML
function generateProjectCard(project) {
    // Generate audio/music embed if available
    const mediaHTML = project.mediaEmbed ? `
        <div class="project-media">
            ${generateMediaEmbed(project.mediaEmbed)}
        </div>
    ` : '';
    
    // Generate video embed if available (separate from audio)
    const videoHTML = project.videoEmbed ? `
        <div class="project-video">
            ${generateMediaEmbed(project.videoEmbed)}
        </div>
    ` : '';
    
    // Generate action links if available
    let linksHTML = '';
    if (project.watchLink || project.listenLink || project.imdbLink) {
        linksHTML = '<div class="project-links">';
        
        if (project.watchLink && project.watchLink.trim()) {
            linksHTML += `
                <a href="${project.watchLink}" class="btn-link" target="_blank">
                    <i class="fas fa-play"></i> 
                    <span data-translate="media.watch">Watch</span>
                </a>
            `;
        }
        
        if (project.listenLink && project.listenLink.trim()) {
            linksHTML += `
                <a href="${project.listenLink}" class="btn-link" target="_blank">
                    <i class="fas fa-music"></i> 
                    <span data-translate="media.listen">Listen</span>
                </a>
            `;
        }
        
        if (project.imdbLink && project.imdbLink.trim()) {
            linksHTML += `
                <a href="${project.imdbLink}" class="btn-link btn-imdb" target="_blank">
                    <i class="fab fa-imdb"></i> 
                    <span>IMDb</span>
                </a>
            `;
        }
        
        linksHTML += '</div>';
    }
    
    // Generate credits if available
    let creditsHTML = '';
    if (project.director || project.production) {
        creditsHTML = '<div class="project-credits">';
        
        if (project.director && project.director.trim()) {
            creditsHTML += `
                <p><strong data-translate="media.director">Director:</strong> ${project.director}</p>
            `;
        }
        
        if (project.production && project.production.trim()) {
            creditsHTML += `
                <p><strong data-translate="media.production">Production:</strong> ${project.production}</p>
            `;
        }
        
        creditsHTML += '</div>';
    }
    
    // Generate awards if available
    let awardsHTML = '';
    if (project.awards && project.awards.trim()) {
        awardsHTML = `
            <div class="project-awards">
                <h4><i class="fas fa-trophy"></i> Awards & Nominations</h4>
                <p>${project.awards}</p>
            </div>
        `;
    }
    
    return `
        <div class="project-card">
            <div class="project-image" style="cursor: pointer;" onclick="openImageLightbox('${project.imageUrl}', '${project.title}')">
                <img src="${project.imageUrl}" alt="${project.title}" title="${project.title} - Project Image" loading="lazy" width="800" height="600">
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-type">${project.projectType} • ${project.year}</p>
                <p class="project-description">
                    ${project.description}
                </p>
                ${creditsHTML}
                ${awardsHTML}
                ${mediaHTML}
                ${videoHTML}
                ${linksHTML}
            </div>
        </div>
    `;
}

// Function to generate grid item HTML
function generateGridItem(project, index) {
    const hasVideo = project.videoEmbed && project.videoEmbed.trim() !== '';
    
    return `
        <div class="project-grid-item" 
             data-project-index="${index}"
             data-has-video="${hasVideo}">
            <div class="project-grid-image">
                <img src="${project.imageUrl}" alt="${project.title}" title="${project.title} - Click to view details" loading="lazy" width="400" height="300">
            </div>
        </div>
    `;
}

// Store projects globally for detail view
let allProjects = [];

// Function to show project detail
function showProjectDetail(index) {
    const project = allProjects[index];
    const detailView = document.querySelector('.project-detail-view');
    const detailContent = document.querySelector('.project-detail-content');
    const gridView = document.querySelector('.projects-grid');
    const heroSection = document.querySelector('.hero-section');
    
    if (detailView && detailContent && gridView) {
        detailContent.innerHTML = generateProjectCard(project);
        gridView.style.display = 'none';
        detailView.style.display = 'block';
        
        // Hide hero section
        if (heroSection) {
            heroSection.style.display = 'none';
        }
        
        // Scroll to the detail view to focus on the cover
        setTimeout(() => {
            detailView.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
        
        // Update translations if available
        if (typeof updatePageContent === 'function') {
            updatePageContent();
        }
    }
}

// Function to show grid view
function showGridView() {
    const detailView = document.querySelector('.project-detail-view');
    const gridView = document.querySelector('.projects-grid');
    const heroSection = document.querySelector('.hero-section');
    
    if (detailView && gridView) {
        detailView.style.display = 'none';
        gridView.style.display = 'grid';
        
        // Show hero section again
        if (heroSection) {
            heroSection.style.display = 'block';
        }
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Function to filter projects by category
function filterProjects(category) {
    const gridItems = document.querySelectorAll('.project-grid-item');
    
    gridItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

// Function to populate projects on page load
async function populateMediaProjects() {
    const projects = await loadMediaProjectsCSV();
    allProjects = projects;
    
    const projectsGrid = document.querySelector('.projects-grid');
    
    if (projectsGrid && projects.length > 0) {
        let gridHTML = '';
        
        projects.forEach((project, index) => {
            gridHTML += generateGridItem(project, index);
        });
        
        projectsGrid.innerHTML = gridHTML;
        
        // Add click handlers to grid items
        document.querySelectorAll('.project-grid-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.getAttribute('data-project-index'));
                showProjectDetail(index);
            });
        });
        
        // Add click handler to back button
        const backBtn = document.querySelector('.back-to-grid-btn');
        if (backBtn) {
            backBtn.addEventListener('click', showGridView);
        }
        
        // Update translations if translation system is available
        if (typeof updatePageContent === 'function') {
            updatePageContent();
        }
    } else if (projectsGrid && projects.length === 0) {
        projectsGrid.innerHTML = '<p style="text-align: center; color: #666;">No projects available yet.</p>';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateMediaProjects);
} else {
    populateMediaProjects();
}

// Image Lightbox Functions
function openImageLightbox(imageUrl, imageAlt) {
    const lightbox = document.querySelector('.image-lightbox');
    const lightboxImg = lightbox.querySelector('img');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageUrl;
        lightboxImg.alt = imageAlt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

function closeImageLightbox() {
    const lightbox = document.querySelector('.image-lightbox');
    
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// Add event listeners for lightbox
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.querySelector('.image-lightbox');
    const closeBtn = document.querySelector('.lightbox-close');
    
    if (lightbox) {
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeImageLightbox();
            }
        });
    }
    
    if (closeBtn) {
        // Close on X button click
        closeBtn.addEventListener('click', closeImageLightbox);
    }
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageLightbox();
        }
    });
});
