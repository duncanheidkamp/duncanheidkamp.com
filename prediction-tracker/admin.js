/*
=============================================
ADMIN.JS - Admin Panel Logic
=============================================
This file handles:
- Login/authentication
- Adding new predictions
- Editing predictions (with history tracking)
- Resolving predictions (with Brier score)
- Deleting predictions
=============================================
*/

// ============================================
// GLOBAL STATE
// ============================================
let supabaseClient = null;
let predictions = [];
let isLoggedIn = false;


// ============================================
// INITIALIZE
// ============================================
function init() {
    console.log('Initializing Admin Panel...');

    // Check if admin password is configured
    if (!CONFIG.isAdminConfigured()) {
        showPasswordError();
        return;
    }

    // Initialize Supabase if configured
    if (CONFIG.isSupabaseConfigured()) {
        try {
            supabaseClient = window.supabase.createClient(
                CONFIG.supabaseUrl,
                CONFIG.supabaseKey
            );
            console.log('Supabase connected');
        } catch (error) {
            console.error('Supabase connection failed:', error);
        }
    } else {
        console.log('Demo mode - Supabase not configured');
    }

    // Setup login form
    setupLogin();

    // Check if already logged in (session storage)
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminPanel();
    }
}


// ============================================
// LOGIN
// ============================================
function setupLogin() {
    const form = document.getElementById('loginForm');

    if (!form) {
        console.error('Login form not found');
        return;
    }

    console.log('Setting up login form...');
    console.log('Expected password length:', CONFIG.adminPassword.length);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const passwordInput = document.getElementById('password');
        const password = passwordInput.value;

        console.log('Login attempt - password entered:', password.length, 'chars');

        if (password === CONFIG.adminPassword) {
            console.log('Password correct!');
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            console.log('Password incorrect');
            document.getElementById('loginError').textContent = 'Incorrect password';
            passwordInput.value = '';
        }
    });
}

function showAdminPanel() {
    isLoggedIn = true;
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';

    // Load data and setup UI
    loadPredictions().then(() => {
        setupTabs();
        setupAddForm();
        setupEditModal();
        setupResolveModal();
        setupLogout();
        renderAll();
    });
}

function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        location.reload();
    });
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
        alert('Failed to load predictions: ' + error.message);
    }
}


// ============================================
// TAB NAVIGATION
// ============================================
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabId = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });

            if (tabId === 'manage') renderManageList();
            if (tabId === 'resolve') renderResolveList();
        });
    });
}


// ============================================
// ADD NEW PREDICTION
// ============================================
function setupAddForm() {
    const form = document.getElementById('addForm');

    // Set default date to 1 month from now
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 1);
    document.getElementById('resolutionDate').value = defaultDate.toISOString().split('T')[0];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const prediction = {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim(),
            probability: parseInt(document.getElementById('probability').value),
            category: document.getElementById('category').value,
            resolution_date: document.getElementById('resolutionDate').value,
            resolved: false,
            outcome: null,
            brier_score: null,
            resolved_at: null
        };

        // Validate probability
        if (prediction.probability < 1 || prediction.probability > 99) {
            alert('Probability must be between 1 and 99');
            return;
        }

        try {
            const { data, error } = await supabaseClient
                .from('predictions')
                .insert([prediction])
                .select()
                .single();

            if (error) throw error;

            predictions.unshift(data);
            form.reset();
            document.getElementById('resolutionDate').value = defaultDate.toISOString().split('T')[0];

            alert('Prediction added successfully!');
            renderAll();

        } catch (error) {
            console.error('Error adding prediction:', error);
            alert('Failed to add prediction: ' + error.message);
        }
    });
}


// ============================================
// MANAGE PREDICTIONS
// ============================================
function renderManageList() {
    const container = document.getElementById('manageList');
    const filter = document.getElementById('manageFilter').value;

    let filtered = [...predictions];

    if (filter === 'active') {
        filtered = filtered.filter(p => !p.resolved);
    } else if (filter === 'resolved') {
        filtered = filtered.filter(p => p.resolved);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No predictions found</p></div>';
        return;
    }

    container.innerHTML = filtered.map(p => renderAdminCard(p)).join('');

    // Setup filter change handler
    document.getElementById('manageFilter').onchange = renderManageList;
}

function renderAdminCard(prediction) {
    const isOverdue = !prediction.resolved &&
        new Date(prediction.resolution_date) < new Date();

    return `
        <div class="admin-card ${prediction.resolved ? 'resolved' : ''}">
            <div class="admin-card-header">
                <span class="admin-card-name">${escapeHtml(prediction.name)}</span>
                <div class="admin-card-actions">
                    ${!prediction.resolved ? `
                        <button class="btn btn-small btn-primary" onclick="openEditModal('${prediction.id}')">Edit</button>
                    ` : ''}
                    <button class="btn btn-small btn-danger" onclick="deletePrediction('${prediction.id}')">Delete</button>
                </div>
            </div>
            <div class="admin-card-meta">
                <span>${prediction.probability}%</span>
                <span>${formatCategory(prediction.category)}</span>
                <span>${formatDate(prediction.resolution_date)}</span>
                ${prediction.resolved ? `<span class="badge ${prediction.outcome ? 'badge-happened' : 'badge-did-not-happen'}">${prediction.outcome ? 'Happened' : 'Did Not Happen'}</span>` : ''}
                ${isOverdue ? '<span class="overdue-warning">Overdue</span>' : ''}
            </div>
        </div>
    `;
}


// ============================================
// EDIT PREDICTION
// ============================================
function setupEditModal() {
    const modal = document.getElementById('editModal');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', closeEditModal);
    overlay.addEventListener('click', closeEditModal);

    // Form submit
    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveEdit();
    });
}

function openEditModal(id) {
    const prediction = predictions.find(p => p.id === id);
    if (!prediction) return;

    document.getElementById('editId').value = id;
    document.getElementById('editName').value = prediction.name;
    document.getElementById('editDescription').value = prediction.description;
    document.getElementById('editProbability').value = prediction.probability;
    document.getElementById('editCategory').value = prediction.category;
    document.getElementById('editResolutionDate').value = prediction.resolution_date;

    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

async function saveEdit() {
    const id = document.getElementById('editId').value;
    const oldPrediction = predictions.find(p => p.id === id);

    const updates = {
        name: document.getElementById('editName').value.trim(),
        description: document.getElementById('editDescription').value.trim(),
        probability: parseInt(document.getElementById('editProbability').value),
        category: document.getElementById('editCategory').value,
        resolution_date: document.getElementById('editResolutionDate').value
    };

    // Validate probability
    if (updates.probability < 1 || updates.probability > 99) {
        alert('Probability must be between 1 and 99');
        return;
    }

    try {
        // Track changes in history
        const historyEntries = [];

        if (oldPrediction.probability !== updates.probability) {
            historyEntries.push({
                prediction_id: id,
                field_name: 'probability',
                old_value: oldPrediction.probability.toString() + '%',
                new_value: updates.probability.toString() + '%'
            });
        }

        if (oldPrediction.name !== updates.name) {
            historyEntries.push({
                prediction_id: id,
                field_name: 'name',
                old_value: oldPrediction.name,
                new_value: updates.name
            });
        }

        if (oldPrediction.resolution_date !== updates.resolution_date) {
            historyEntries.push({
                prediction_id: id,
                field_name: 'resolution_date',
                old_value: oldPrediction.resolution_date,
                new_value: updates.resolution_date
            });
        }

        // Save history entries
        if (historyEntries.length > 0) {
            const { error: historyError } = await supabaseClient
                .from('prediction_history')
                .insert(historyEntries);

            if (historyError) {
                console.warn('Failed to save history:', historyError);
            }
        }

        // Update prediction
        const { error } = await supabaseClient
            .from('predictions')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        // Update local state
        const index = predictions.findIndex(p => p.id === id);
        predictions[index] = { ...predictions[index], ...updates };

        closeEditModal();
        alert('Prediction updated!');
        renderAll();

    } catch (error) {
        console.error('Error updating prediction:', error);
        alert('Failed to update: ' + error.message);
    }
}


// ============================================
// DELETE PREDICTION
// ============================================
async function deletePrediction(id) {
    const prediction = predictions.find(p => p.id === id);
    if (!prediction) return;

    if (!confirm(`Delete "${prediction.name}"?\n\nThis cannot be undone.`)) {
        return;
    }

    try {
        // Delete history first
        await supabaseClient
            .from('prediction_history')
            .delete()
            .eq('prediction_id', id);

        // Delete prediction
        const { error } = await supabaseClient
            .from('predictions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        predictions = predictions.filter(p => p.id !== id);
        alert('Prediction deleted');
        renderAll();

    } catch (error) {
        console.error('Error deleting prediction:', error);
        alert('Failed to delete: ' + error.message);
    }
}


// ============================================
// RESOLVE PREDICTIONS
// ============================================
function renderResolveList() {
    const container = document.getElementById('resolveList');

    // Only show unresolved predictions that are at or past their resolution date
    const toResolve = predictions.filter(p => !p.resolved);

    if (toResolve.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No predictions to resolve</p></div>';
        return;
    }

    // Sort by resolution date (oldest first)
    toResolve.sort((a, b) => new Date(a.resolution_date) - new Date(b.resolution_date));

    container.innerHTML = toResolve.map(p => {
        const isOverdue = new Date(p.resolution_date) < new Date();

        return `
            <div class="admin-card">
                <div class="admin-card-header">
                    <span class="admin-card-name">${escapeHtml(p.name)}</span>
                    <button class="btn btn-small btn-warning" onclick="openResolveModal('${p.id}')">
                        Resolve
                    </button>
                </div>
                <div class="admin-card-meta">
                    <span>${p.probability}%</span>
                    <span>${formatCategory(p.category)}</span>
                    <span>${formatDate(p.resolution_date)}</span>
                    ${isOverdue ? '<span class="overdue-warning">Overdue - Ready to resolve</span>' : ''}
                </div>
            </div>
        `;
    }).join('');
}

function setupResolveModal() {
    const modal = document.getElementById('resolveModal');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', closeResolveModal);
    overlay.addEventListener('click', closeResolveModal);
}

function openResolveModal(id) {
    const prediction = predictions.find(p => p.id === id);
    if (!prediction) return;

    document.getElementById('resolveId').value = id;
    document.getElementById('resolveModalName').textContent = prediction.name;
    document.getElementById('resolveModal').classList.add('active');
}

function closeResolveModal() {
    document.getElementById('resolveModal').classList.remove('active');
}

async function resolvePrediction(outcome) {
    const id = document.getElementById('resolveId').value;
    const prediction = predictions.find(p => p.id === id);
    if (!prediction) return;

    // Calculate Brier Score
    // Brier = (probability - outcome)²
    // probability is 0-100, we need 0-1
    // outcome is true (1) or false (0)
    const prob = prediction.probability / 100;
    const outcomeValue = outcome ? 1 : 0;
    const brierScore = Math.pow(prob - outcomeValue, 2);

    const updates = {
        resolved: true,
        outcome: outcome,
        brier_score: brierScore,
        resolved_at: new Date().toISOString()
    };

    try {
        const { error } = await supabaseClient
            .from('predictions')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        // Update local state
        const index = predictions.findIndex(p => p.id === id);
        predictions[index] = { ...predictions[index], ...updates };

        closeResolveModal();
        alert(`Resolved! Brier Score: ${brierScore.toFixed(3)}\n\n${brierScore < 0.25 ? 'Good prediction!' : brierScore < 0.5 ? 'Average prediction.' : 'Poor prediction.'}`);
        renderAll();

    } catch (error) {
        console.error('Error resolving prediction:', error);
        alert('Failed to resolve: ' + error.message);
    }
}


// ============================================
// RENDER ALL
// ============================================
function renderAll() {
    renderManageList();
    renderResolveList();
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

function showConfigError() {
    document.querySelector('.app').innerHTML = `
        <div class="error-state" style="padding: 40px;">
            <h2>Configuration Required</h2>
            <p style="margin: 16px 0;">Supabase is not configured.</p>
            <p>Edit <code>config.js</code> and add your Supabase URL and key.</p>
        </div>
    `;
}

function showPasswordError() {
    document.querySelector('.app').innerHTML = `
        <div class="error-state" style="padding: 40px;">
            <h2>Password Required</h2>
            <p style="margin: 16px 0;">Admin password is not configured.</p>
            <p>Edit <code>config.js</code> and set a secure password (at least 8 characters).</p>
        </div>
    `;
}


// ============================================
// START APP
// ============================================
document.addEventListener('DOMContentLoaded', init);
