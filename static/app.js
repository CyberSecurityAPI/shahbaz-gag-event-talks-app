document.addEventListener('DOMContentLoaded', () => {
    // State
    let releases = [];
    let filteredReleases = [];

    // DOM Elements
    const releasesList = document.getElementById('releases-list');
    const searchInput = document.getElementById('search-input');
    const refreshBtn = document.getElementById('refresh-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');
    const skeleton = document.getElementById('loading-skeleton');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const retryBtn = document.getElementById('retry-btn');
    const emptyState = document.getElementById('empty-state');

    // Tweet Modal Elements
    const tweetModal = document.getElementById('tweet-modal');
    const tweetTextarea = document.getElementById('tweet-textarea');
    const charCount = document.getElementById('char-count');
    const closeModelBtn = document.getElementById('close-modal-btn');
    const cancelTweetBtn = document.getElementById('cancel-tweet-btn');
    const postTweetBtn = document.getElementById('post-tweet-btn');

    // Load Data on Startup
    fetchReleases();

    // Event Listeners
    refreshBtn.addEventListener('click', fetchReleases);
    retryBtn.addEventListener('click', fetchReleases);
    searchInput.addEventListener('input', handleSearch);

    // Modal Events
    closeModelBtn.addEventListener('click', closeTweetModal);
    cancelTweetBtn.addEventListener('click', closeTweetModal);
    tweetTextarea.addEventListener('input', updateCharCount);

    // Fetch Release Notes from API
    async function fetchReleases() {
        showLoadingState();
        try {
            const response = await fetch('/api/releases');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Server error occurred');
            }

            releases = data.releases || [];
            filteredReleases = [...releases];
            renderReleases();
        } catch (error) {
            showErrorState(error.message);
        }
    }

    // UI States
    function showLoadingState() {
        skeleton.classList.remove('hidden');
        releasesList.classList.add('hidden');
        errorMessage.classList.add('hidden');
        emptyState.classList.add('hidden');
        
        // Spin the refresh button
        refreshBtn.disabled = true;
        btnText.textContent = 'Syncing...';
        spinner.classList.remove('hidden');
    }

    function showErrorState(message) {
        skeleton.classList.add('hidden');
        releasesList.classList.add('hidden');
        errorMessage.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        errorText.textContent = message || 'Failed to fetch release notes.';
        
        // Reset refresh button
        refreshBtn.disabled = false;
        btnText.textContent = 'Refresh';
        spinner.classList.add('hidden');
    }

    function renderReleases() {
        skeleton.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Reset refresh button
        refreshBtn.disabled = false;
        btnText.textContent = 'Refresh';
        spinner.classList.add('hidden');

        if (filteredReleases.length === 0) {
            releasesList.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        releasesList.classList.remove('hidden');
        releasesList.innerHTML = '';

        filteredReleases.forEach((release, index) => {
            const card = document.createElement('article');
            card.className = 'release-card';
            card.id = `release-card-${index}`;
            
            // Format HTML body content safely
            const cardContent = `
                <div class="card-header">
                    <span class="release-date">${release.date}</span>
                    <button class="tweet-card-btn" data-index="${index}" aria-label="Tweet about this release">
                        <svg class="x-logo-svg" viewBox="0 0 24 24" width="12" height="12">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        Tweet Note
                    </button>
                </div>
                <div class="card-body">
                    <h2 class="release-title">${release.title}</h2>
                    <div class="release-desc">${release.content}</div>
                </div>
            `;
            
            card.innerHTML = cardContent;
            releasesList.appendChild(card);
        });

        // Add event listeners to the new tweet buttons
        document.querySelectorAll('.tweet-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                openTweetModal(filteredReleases[index]);
            });
        });
    }

    // Search / Filtering
    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            filteredReleases = [...releases];
        } else {
            filteredReleases = releases.filter(release => {
                return release.title.toLowerCase().includes(query) || 
                       release.content.toLowerCase().includes(query) ||
                       release.date.toLowerCase().includes(query);
            });
        }
        renderReleases();
    }

    // Tweet Modal Logic
    function openTweetModal(release) {
        // Pre-populate tweet content
        const hashtags = "\n\n#BigQuery #GoogleCloud #DataAnalytics";
        const link = `\nSource: ${release.link}`;
        
        // Clean Title for tweet preview (strip HTML tags if any)
        const cleanTitle = release.title.replace(/<\/?[^>]+(>|$)/g, "");
        
        // Construct base tweet template
        let headerText = `🚀 BigQuery Update (${release.date}):\n\n`;
        let availableChars = 280 - headerText.length - link.length - hashtags.length;
        
        let titleSnippet = cleanTitle;
        if (titleSnippet.length > availableChars) {
            titleSnippet = titleSnippet.substring(0, availableChars - 3) + "...";
        }
        
        const defaultTweet = `${headerText}${titleSnippet}${link}${hashtags}`;
        
        tweetTextarea.value = defaultTweet;
        updateCharCount();
        
        // Show modal with animation
        tweetModal.classList.remove('hidden');
        tweetTextarea.focus();
        
        // Setup Post action (remove previous listener)
        const newPostTweetBtn = postTweetBtn.cloneNode(true);
        postTweetBtn.parentNode.replaceChild(newPostTweetBtn, postTweetBtn);
        
        newPostTweetBtn.addEventListener('click', () => {
            const tweetText = tweetTextarea.value;
            if (tweetText.length > 280) {
                alert("Tweet is too long! Please keep it under 280 characters.");
                return;
            }
            const encodedText = encodeURIComponent(tweetText);
            window.open(`https://x.com/intent/tweet?text=${encodedText}`, '_blank');
            closeTweetModal();
        });
    }

    function closeTweetModal() {
        tweetModal.classList.add('hidden');
    }

    function updateCharCount() {
        const len = tweetTextarea.value.length;
        charCount.textContent = len;
        
        const counterContainer = charCount.parentElement;
        counterContainer.className = 'tweet-counter-container';
        
        if (len > 280) {
            counterContainer.classList.add('danger');
        } else if (len > 250) {
            counterContainer.classList.add('warning');
        }
    }
});
