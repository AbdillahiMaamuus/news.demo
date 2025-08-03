
        // Data storage and initialization
        let articles = JSON.parse(localStorage.getItem('newsArticles')) || [];
        let currentArticleId = null;
        let currentAction = null;
        let stats = {
            total: 0,
            news: 0,
            technology: 0,
            sports: 0
        };

        // DOM Elements
        const elements = {
            statsContainer: document.getElementById('stats-container'),
            articlesList: document.getElementById('articles-list'),
            articleSearch: document.getElementById('article-search'),
            articleForm: document.getElementById('article-form'),
            formTitle: document.getElementById('form-title'),
            addArticleBtn: document.getElementById('add-article-btn'),
            cancelFormBtn: document.getElementById('cancel-form'),
            saveDraftBtn: document.getElementById('save-draft'),
            publishBtn: document.getElementById('publish-article'),
            confirmationModal: document.getElementById('confirmation-modal'),
            modalMessage: document.getElementById('modal-message'),
            closeModalBtn: document.getElementById('close-modal'),
            cancelActionBtn: document.getElementById('cancel-action'),
            confirmActionBtn: document.getElementById('confirm-action')
        };

        // Form fields
        const formFields = {
            title: document.getElementById('article-title'),
            summary: document.getElementById('article-summary'),
            content: document.getElementById('article-content'),
            category: document.getElementById('article-category'),
            image: document.getElementById('article-image'),
            status: document.getElementById('article-status'),
            imagePreview: document.getElementById('image-preview')
        };

        // Initialize the admin panel
        function initAdminPanel() {
            calculateStats();
            renderStats();
            renderArticles();
            setupEventListeners();
        }

        // Calculate statistics
        function calculateStats() {
            stats.total = articles.length;
            stats.news = articles.filter(a => a.category === 'news').length;
            stats.technology = articles.filter(a => a.category === 'technology').length;
            stats.sports = articles.filter(a => a.category === 'sports').length;
        }

        // Render statistics cards
        function renderStats() {
            elements.statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Total Articles</h3>
                        <div class="stat-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                    </div>
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">${stats.total > 0 ? '+3 this week' : 'No articles yet'}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>News Articles</h3>
                        <div class="stat-icon news">
                            <i class="fas fa-globe"></i>
                        </div>
                    </div>
                    <div class="stat-value">${stats.news}</div>
                    <div class="stat-label">${stats.news > 0 ? 'Most viewed category' : 'No news articles'}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Technology</h3>
                        <div class="stat-icon tech">
                            <i class="fas fa-microchip"></i>
                        </div>
                    </div>
                    <div class="stat-value">${stats.technology}</div>
                    <div class="stat-label">${stats.technology > 0 ? '+1 this week' : 'No tech articles'}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <h3>Sports</h3>
                        <div class="stat-icon sports">
                            <i class="fas fa-football-ball"></i>
                        </div>
                    </div>
                    <div class="stat-value">${stats.sports}</div>
                    <div class="stat-label">${stats.sports > 0 ? 'Popular category' : 'No sports articles'}</div>
                </div>
            `;
        }

        // Render articles table
        function renderArticles() {
            const searchTerm = elements.articleSearch.value.toLowerCase();
            const filteredArticles = articles.filter(article => 
                article.title.toLowerCase().includes(searchTerm) ||
                article.summary.toLowerCase().includes(searchTerm) ||
                article.category.toLowerCase().includes(searchTerm)
            );
            
            if (filteredArticles.length === 0) {
                elements.articlesList.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 30px;">
                            <i class="fas fa-file-alt" style="font-size: 40px; margin-bottom: 15px; color: #cbd5e0;"></i>
                            <p>No articles found</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            elements.articlesList.innerHTML = filteredArticles.map(article => `
                <tr data-id="${article.id}">
                    <td>${article.title}</td>
                    <td><span class="category-tag ${getCategoryClass(article.category)}">${formatCategory(article.category)}</span></td>
                    <td>${formatDate(article.date)}</td>
                    <td><span class="status ${article.status || 'published'}">${article.status === 'draft' ? 'Draft' : 'Published'}</span></td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${article.id}"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn" data-id="${article.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }

        // Show article form
        function showArticleForm(article = null) {
            elements.articleForm.style.display = 'block';
            
            if (article) {
                // Editing existing article
                elements.formTitle.textContent = 'Edit Article';
                currentArticleId = article.id;
                
                formFields.title.value = article.title;
                formFields.summary.value = article.summary;
                formFields.content.value = article.content;
                formFields.category.value = article.category;
                formFields.image.value = article.image || '';
                formFields.status.value = article.status || 'published';
                
                // Scroll to form
                elements.articleForm.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Adding new article
                elements.formTitle.textContent = 'Add New Article';
                currentArticleId = null;
                
                // Reset form
                formFields.title.value = '';
                formFields.summary.value = '';
                formFields.content.value = '';
                formFields.category.value = '';
                formFields.image.value = '';
                formFields.status.value = 'published';
            }
            
            // Update image preview
            updateImagePreview();
        }

        // Hide article form
        function hideArticleForm() {
            elements.articleForm.style.display = 'none';
            currentArticleId = null;
        }

        // Save article
        function saveArticle(status) {
            // Form validation
            if (!formFields.title.value || !formFields.summary.value || !formFields.content.value || !formFields.category.value) {
                showModal('Please fill in all required fields', 'error');
                return;
            }
            
            const articleData = {
                id: currentArticleId || Date.now(),
                title: formFields.title.value,
                summary: formFields.summary.value,
                content: formFields.content.value,
                category: formFields.category.value,
                image: formFields.image.value || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200',
                date: new Date().toISOString().split('T')[0],
                status: status
            };
            
            if (currentArticleId) {
                // Update existing article
                const index = articles.findIndex(a => a.id === currentArticleId);
                if (index !== -1) {
                    articles[index] = articleData;
                }
            } else {
                // Add new article
                articles.unshift(articleData);
            }
            
            // Save to localStorage
            localStorage.setItem('newsArticles', JSON.stringify(articles));
            
            // Update UI
            calculateStats();
            renderStats();
            renderArticles();
            hideArticleForm();
            
            // Show success message
            showModal(`Article ${currentArticleId ? 'updated' : 'created'} successfully!`, 'success');
        }

        // Delete article
        function deleteArticle(articleId) {
            articles = articles.filter(article => article.id !== articleId);
            localStorage.setItem('newsArticles', JSON.stringify(articles));
            
            calculateStats();
            renderStats();
            renderArticles();
            
            showModal('Article deleted successfully!', 'success');
        }

        // Show confirmation modal
        function showConfirmationModal(message, action, articleId) {
            elements.modalMessage.textContent = message;
            currentAction = { action, articleId };
            elements.confirmationModal.classList.add('active');
        }

        // Hide confirmation modal
        function hideConfirmationModal() {
            elements.confirmationModal.classList.remove('active');
            currentAction = null;
        }

        // Show status modal
        function showModal(message, type) {
            elements.modalMessage.textContent = message;
            elements.confirmationModal.classList.add('active');
            
            // Change button color based on type
            elements.confirmActionBtn.className = 'btn btn-' + 
                (type === 'success' ? 'primary' : type === 'error' ? 'secondary' : 'primary');
            elements.confirmActionBtn.textContent = 'OK';
        }

        // Format category for display
        function formatCategory(category) {
            return category.charAt(0).toUpperCase() + category.slice(1);
        }

        // Get category CSS class
        function getCategoryClass(category) {
            return `tag-${category}`;
        }

        // Format date for display
        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }

        // Update image preview
        function updateImagePreview() {
            if (formFields.image.value) {
                formFields.imagePreview.src = formFields.image.value;
                formFields.imagePreview.style.display = 'block';
            } else {
                formFields.imagePreview.style.display = 'none';
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            // Search articles
            elements.articleSearch.addEventListener('input', renderArticles);
            
            // Add article button
            elements.addArticleBtn.addEventListener('click', () => showArticleForm());
            
            // Cancel form
            elements.cancelFormBtn.addEventListener('click', hideArticleForm);
            
            // Save draft
            elements.saveDraftBtn.addEventListener('click', () => saveArticle('draft'));
            
            // Publish article
            elements.publishBtn.addEventListener('click', () => saveArticle('published'));
            
            // Edit and delete buttons (delegated)
            elements.articlesList.addEventListener('click', (e) => {
                if (e.target.closest('.edit-btn')) {
                    const articleId = parseInt(e.target.closest('.edit-btn').dataset.id);
                    const article = articles.find(a => a.id === articleId);
                    if (article) showArticleForm(article);
                }
                
                if (e.target.closest('.delete-btn')) {
                    const articleId = parseInt(e.target.closest('.delete-btn').dataset.id);
                    const article = articles.find(a => a.id === articleId);
                    if (article) {
                        showConfirmationModal(
                            `Are you sure you want to delete "${article.title}"?`, 
                            'delete', 
                            articleId
                        );
                    }
                }
            });
            
            // Image URL input
            formFields.image.addEventListener('input', updateImagePreview);
            
            // Modal actions
            elements.closeModalBtn.addEventListener('click', hideConfirmationModal);
            elements.cancelActionBtn.addEventListener('click', hideConfirmationModal);
            elements.confirmActionBtn.addEventListener('click', () => {
                if (currentAction) {
                    if (currentAction.action === 'delete') {
                        deleteArticle(currentAction.articleId);
                    }
                }
                hideConfirmationModal();
            });
            
            // Close modal when clicking outside
            elements.confirmationModal.addEventListener('click', (e) => {
                if (e.target === elements.confirmationModal) {
                    hideConfirmationModal();
                }
            });
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', initAdminPanel);