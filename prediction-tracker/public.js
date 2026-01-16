/*
=============================================
PUBLIC.JS - Public Dashboard Logic
=============================================
This file handles:
- Loading predictions from Supabase
- Displaying active and resolved predictions
- Calculating and displaying statistics
- Modal for prediction details
=============================================
*/

// ============================================
// GLOBAL STATE
// ============================================
let supabaseClient = null;
let predictions = [];
let predictionHistory = [];


// ============================================
// INITIALIZE APP
// ============================================
async function init() {
    console.log('Initializing Prediction Tracker...');

    // Setup UI first (so tabs always work)
    setupTabs();
    setupFilters();
    setupModal();

    // Initialize Supabase connection
    if (CONFIG.isSupabaseConfigured()) {
        try {
            supabaseClient = window.supabase.createClient(
                CONFIG.supabaseUrl,
                CONFIG.supabaseKey
            );
            console.log('Supabase connected');

            // Load data
            await loadPredictions();
            await loadHistory();

        } catch (error) {
            console.error('Supabase connection failed:', error);
            // Show demo data as fallback
            loadDemoData();
        }
    } else {
        console.warn('Supabase not configured - showing demo mode');
        loadDemoData();
        showDemoNotice();
    }

    // Render whatever data we have
    renderAll();
}

function loadDemoData() {
    predictions = [
        {
            id: 'demo-1',
            name: 'Example: AI will pass the Turing Test',
            description: 'An AI system will convincingly pass a rigorous Turing Test administered by experts.',
            probability: 35,
            category: 'world_events',
            resolution_date: '2026-12-31',
            created_at: '2024-01-15',
            resolved: false
        },
        {
            id: 'demo-2',
            name: 'Example: S&P 500 ends 2025 above 5500',
            description: 'The S&P 500 index will close above 5500 on the last trading day of 2025.',
            probability: 65,
            category: 'business_finance',
            resolution_date: '2025-12-31',
            created_at: '2024-01-10',
            resolved: true,
            outcome: true,
            resolved_at: '2025-12-31',
            brier_score: 0.1225
        }
    ];
}

function showDemoNotice() {
    const header = document.querySelector('.header');
    if (header) {
        header.insertAdjacentHTML('beforeend', `
            <p style="background: #fef3c7; color: #92400e; padding: 8px; border-radius: 4px; margin-top: 16px; font-size: 14px;">
                Demo Mode - Configure Supabase in config.js to see real data
            </p>
        `);
    }
}


// ============================================
// DATA LOADING
// ============================================
async function loadPredictions() {
    try {
        const { data, error } = await supabaseClient
            .from('predictions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        predictions = data || [];
        console.log(`Loaded ${predictions.length} predictions`);
    } catch (error) {
        console.error('Error loading predictions:', error);
        showError('Failed to load predictions');
    }
}

async function loadHistory() {
    try {
        const { data, error } = await supabaseClient
            .from('prediction_history')
            .select('*')
            .order('changed_at', { ascending: false });

        if (error) throw error;
        predictionHistory = data || [];
        console.log(`Loaded ${predictionHistory.length} history entries`);
    } catch (error) {
        console.error('Error loading history:', error);
        // History is optional, don't show error
    }
}


// ============================================
// TAB NAVIGATION
// ============================================
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show corresponding content
            const tabId = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });

            // Re-render the active tab content
            if (tabId === 'active') renderActivePredictions();
            if (tabId === 'resolved') renderResolvedPredictions();
            if (tabId === 'stats') renderStats();
        });
    });
}


// ============================================
// FILTERS
// ============================================
function setupFilters() {
    // Active predictions filters
    document.getElementById('activeCategory')?.addEventListener('change', renderActivePredictions);
    document.getElementById('activeSort')?.addEventListener('change', renderActivePredictions);

    // Resolved predictions filters
    document.getElementById('resolvedOutcome')?.addEventListener('change', renderResolvedPredictions);
    document.getElementById('resolvedCategory')?.addEventListener('change', renderResolvedPredictions);
}


// ============================================
// RENDER FUNCTIONS
// ============================================
function renderAll() {
    renderHeaderStats();
    renderActivePredictions();
    renderResolvedPredictions();
    renderStats();
}

function renderHeaderStats() {
    const resolved = predictions.filter(p => p.resolved);
    const pending = predictions.filter(p => !p.resolved);

    // Calculate average Brier score
    const brierScores = resolved.filter(p => p.brier_score !== null);
    const avgBrier = brierScores.length > 0
        ? (brierScores.reduce((sum, p) => sum + p.brier_score, 0) / brierScores.length).toFixed(3)
        : '--';

    document.getElementById('brierScore').textContent = avgBrier;
    document.getElementById('totalResolved').textContent = resolved.length;
    document.getElementById('totalPending').textContent = pending.length;
}

function renderActivePredictions() {
    const container = document.getElementById('activeList');
    const categoryFilter = document.getElementById('activeCategory')?.value || 'all';
    const sortBy = document.getElementById('activeSort')?.value || 'date_asc';

    // Filter to only unresolved predictions
    let active = predictions.filter(p => !p.resolved);

    // Apply category filter
    if (categoryFilter !== 'all') {
        active = active.filter(p => p.category === categoryFilter);
    }

    // Apply sorting
    active.sort((a, b) => {
        switch (sortBy) {
            case 'date_asc':
                return new Date(a.resolution_date) - new Date(b.resolution_date);
            case 'date_desc':
                return new Date(b.resolution_date) - new Date(a.resolution_date);
            case 'probability_high':
                return b.probability - a.probability;
            case 'probability_low':
                return a.probability - b.probability;
            default:
                return 0;
        }
    });

    // Render
    if (active.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No active predictions</p>
            </div>
        `;
        return;
    }

    container.innerHTML = active.map(p => renderPredictionCard(p)).join('');
}

function renderResolvedPredictions() {
    const container = document.getElementById('resolvedList');
    const outcomeFilter = document.getElementById('resolvedOutcome')?.value || 'all';
    const categoryFilter = document.getElementById('resolvedCategory')?.value || 'all';

    // Filter to only resolved predictions
    let resolved = predictions.filter(p => p.resolved);

    // Apply outcome filter
    if (outcomeFilter === 'correct') {
        resolved = resolved.filter(p => p.outcome === true);
    } else if (outcomeFilter === 'incorrect') {
        resolved = resolved.filter(p => p.outcome === false);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
        resolved = resolved.filter(p => p.category === categoryFilter);
    }

    // Sort by resolution date (newest first)
    resolved.sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at));

    // Render
    if (resolved.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No resolved predictions</p>
            </div>
        `;
        return;
    }

    container.innerHTML = resolved.map(p => renderPredictionCard(p, true)).join('');
}

function renderPredictionCard(prediction, showOutcome = false) {
    const resolutionDate = new Date(prediction.resolution_date);
    const isOverdue = !prediction.resolved && resolutionDate < new Date();

    // Determine card class
    let cardClass = 'prediction-card';
    if (prediction.resolved) {
        cardClass += prediction.outcome ? ' happened' : ' did-not-happen';
    } else if (isOverdue) {
        cardClass += ' overdue';
    }

    // Build badges
    const badges = [
        `<span class="badge badge-probability">${prediction.probability}%</span>`,
        `<span class="badge badge-category">${formatCategory(prediction.category)}</span>`,
        `<span class="badge badge-date">${formatDate(prediction.resolution_date)}</span>`
    ];

    // Add outcome badge if resolved
    if (showOutcome && prediction.resolved) {
        if (prediction.outcome) {
            badges.push('<span class="badge badge-happened">Happened</span>');
        } else {
            badges.push('<span class="badge badge-did-not-happen">Did Not Happen</span>');
        }
        if (prediction.brier_score !== null) {
            badges.push(`<span class="badge badge-brier">Brier: ${prediction.brier_score.toFixed(3)}</span>`);
        }
    }

    // Add overdue badge
    if (isOverdue) {
        badges.push('<span class="badge badge-overdue">Overdue</span>');
    }

    return `
        <div class="${cardClass}" onclick="showPredictionDetail('${prediction.id}')">
            <div class="prediction-name">${escapeHtml(prediction.name)}</div>
            <div class="prediction-description">${escapeHtml(prediction.description)}</div>
            <div class="prediction-meta">
                ${badges.join('')}
            </div>
        </div>
    `;
}


// ============================================
// STATISTICS
// ============================================
function renderStats() {
    renderOverallBrier();
    renderCategoryStats();
    renderCalibrationStats();
    renderRecentStats();
}

function renderOverallBrier() {
    const resolved = predictions.filter(p => p.resolved && p.brier_score !== null);

    if (resolved.length === 0) {
        document.getElementById('overallBrier').textContent = '--';
        return;
    }

    const avgBrier = resolved.reduce((sum, p) => sum + p.brier_score, 0) / resolved.length;
    document.getElementById('overallBrier').textContent = avgBrier.toFixed(3);
}

function renderCategoryStats() {
    const container = document.getElementById('categoryStats');
    const categories = ['world_events', 'us_politics', 'business_finance', 'sports', 'misc'];

    const stats = categories.map(cat => {
        const catPredictions = predictions.filter(p => p.category === cat && p.resolved && p.brier_score !== null);
        const avgBrier = catPredictions.length > 0
            ? catPredictions.reduce((sum, p) => sum + p.brier_score, 0) / catPredictions.length
            : null;

        return { category: cat, count: catPredictions.length, brier: avgBrier };
    }).filter(s => s.count > 0);

    if (stats.length === 0) {
        container.innerHTML = '<p class="empty-state">No resolved predictions yet</p>';
        return;
    }

    container.innerHTML = stats.map(s => {
        const barClass = getBrierBarClass(s.brier);
        const barWidth = Math.min(100, (1 - s.brier) * 100); // Invert so lower is better

        return `
            <div class="stat-row">
                <span class="stat-row-label">${formatCategory(s.category)} (${s.count})</span>
                <div style="display: flex; align-items: center;">
                    <span class="stat-row-value">${s.brier.toFixed(3)}</span>
                    <div class="brier-bar">
                        <div class="brier-bar-fill ${barClass}" style="width: ${barWidth}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCalibrationStats() {
    const container = document.getElementById('calibrationStats');

    // Group predictions by probability ranges
    const ranges = [
        { label: '0-20%', min: 0, max: 20 },
        { label: '21-40%', min: 21, max: 40 },
        { label: '41-60%', min: 41, max: 60 },
        { label: '61-80%', min: 61, max: 80 },
        { label: '81-100%', min: 81, max: 100 }
    ];

    const resolved = predictions.filter(p => p.resolved);

    const stats = ranges.map(range => {
        const inRange = resolved.filter(p =>
            p.probability >= range.min && p.probability <= range.max
        );
        const happened = inRange.filter(p => p.outcome === true);
        const actualRate = inRange.length > 0
            ? (happened.length / inRange.length * 100)
            : null;

        return {
            label: range.label,
            expected: (range.min + range.max) / 2,
            actual: actualRate,
            count: inRange.length
        };
    }).filter(s => s.count > 0);

    if (stats.length === 0) {
        container.innerHTML = '<p class="empty-state">No resolved predictions yet</p>';
        return;
    }

    container.innerHTML = stats.map(s => `
        <div class="stat-row">
            <span class="stat-row-label">${s.label} (${s.count})</span>
            <span class="stat-row-value">
                ${s.actual !== null ? s.actual.toFixed(0) + '% happened' : '--'}
            </span>
        </div>
    `).join('');
}

function renderRecentStats() {
    const container = document.getElementById('recentStats');
    const resolved = predictions
        .filter(p => p.resolved && p.brier_score !== null)
        .sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at))
        .slice(0, 20);

    if (resolved.length === 0) {
        container.innerHTML = '<p class="empty-state">No resolved predictions yet</p>';
        return;
    }

    container.innerHTML = resolved.map(p => {
        const isGood = p.brier_score < 0.25;
        return `
            <div class="result-dot ${isGood ? 'good' : 'poor'}"
                 title="${escapeHtml(p.name)}: ${p.brier_score.toFixed(3)}">
            </div>
        `;
    }).join('');
}


// ============================================
// MODAL
// ============================================
function setupModal() {
    const modal = document.getElementById('predictionModal');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function showPredictionDetail(id) {
    const prediction = predictions.find(p => p.id === id);
    if (!prediction) return;

    const modal = document.getElementById('predictionModal');
    const body = document.getElementById('modalBody');

    // Get history for this prediction
    const history = predictionHistory.filter(h => h.prediction_id === id);

    // Build modal content
    let outcomeHtml = '';
    if (prediction.resolved) {
        outcomeHtml = `
            <div class="modal-detail-row">
                <span class="modal-detail-label">Outcome</span>
                <span class="modal-detail-value ${prediction.outcome ? 'text-success' : 'text-danger'}">
                    ${prediction.outcome ? 'Happened' : 'Did Not Happen'}
                </span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Brier Score</span>
                <span class="modal-detail-value">${prediction.brier_score?.toFixed(3) || '--'}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Resolved</span>
                <span class="modal-detail-value">${formatDate(prediction.resolved_at)}</span>
            </div>
        `;
    }

    let historyHtml = '';
    if (history.length > 0) {
        historyHtml = `
            <div class="modal-history">
                <h4>Change History</h4>
                <div class="history-list">
                    ${history.map(h => `
                        <div class="history-item">
                            <span class="history-item-date">${formatDateTime(h.changed_at)}</span>
                            <br>
                            ${h.field_name}: ${h.old_value} → ${h.new_value}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    body.innerHTML = `
        <h2 class="modal-title">${escapeHtml(prediction.name)}</h2>
        <p class="modal-description">${escapeHtml(prediction.description)}</p>

        <div class="modal-details">
            <div class="modal-detail-row">
                <span class="modal-detail-label">Probability</span>
                <span class="modal-detail-value">${prediction.probability}%</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Category</span>
                <span class="modal-detail-value">${formatCategory(prediction.category)}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Resolution Date</span>
                <span class="modal-detail-value">${formatDate(prediction.resolution_date)}</span>
            </div>
            <div class="modal-detail-row">
                <span class="modal-detail-label">Created</span>
                <span class="modal-detail-value">${formatDate(prediction.created_at)}</span>
            </div>
            ${outcomeHtml}
        </div>

        ${historyHtml}
    `;

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('predictionModal').classList.remove('active');
}


// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatCategory(category) {
    const names = {
        'world_events': 'World Events',
        'us_politics': 'U.S. Politics',
        'business_finance': 'Business/Finance',
        'sports': 'Sports',
        'misc': 'Misc'
    };
    return names[category] || category;
}

function getBrierBarClass(brier) {
    if (brier < 0.15) return ''; // Good (green)
    if (brier < 0.25) return 'average'; // Average (yellow)
    return 'poor'; // Poor (red)
}

function showError(message) {
    document.querySelector('.app').innerHTML = `
        <div class="error-state">
            <h2>Error</h2>
            <p>${escapeHtml(message)}</p>
            <p>Please check your configuration and try again.</p>
        </div>
    `;
}

// showDemoMode removed - functionality split into loadDemoData() and showDemoNotice()


// ============================================
// START APP
// ============================================
document.addEventListener('DOMContentLoaded', init);
