document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenuBtn = document.getElementById('close-menu');
    const sideMenu = document.getElementById('side-menu');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const exploreBtn = document.getElementById('explore-btn');
    const adminLink = document.getElementById('admin-link');
    const themeToggle = document.getElementById('theme-toggle');
    const categorySideList = document.getElementById('category-side-list');
    const questionList = document.getElementById('question-list');
    const currentCategory = document.getElementById('current-category');
    
    // State
    let categories = [];
    let darkMode = localStorage.getItem('darkMode') === 'true';
    
    // Initialize theme
    function initTheme() {
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    initTheme();
    
    // Event Listeners
    menuToggle.addEventListener('click', toggleMenu);
    closeMenuBtn.addEventListener('click', toggleMenu);
    sideMenuOverlay.addEventListener('click', toggleMenu);
    exploreBtn.addEventListener('click', function() {
        toggleMenu();
    });
    adminLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'admin.html';
    });
    themeToggle.addEventListener('click', toggleTheme);
    
    // Check if user is admin and redirect
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(user => {
            if (user) {
                // Check if user is admin
                window.location.href = 'admin.html';
            }
        });
    }
    
    // Load categories
    loadCategories();
    
    function toggleMenu() {
        sideMenu.classList.toggle('open');
        sideMenuOverlay.classList.toggle('open');
        document.body.classList.toggle('menu-open');
    }
    
    function toggleTheme() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        initTheme();
    }
    
    function loadCategories() {
        categorySideList.innerHTML = '<li class="loader">Loading categories...</li>';
        
        if (typeof db !== 'undefined') {
            db.collection('categories').get()
                .then(querySnapshot => {
                    categorySideList.innerHTML = '';
                    categories = [];
                    
                    if (querySnapshot.empty) {
                        categorySideList.innerHTML = '<li class="no-categories">No categories found</li>';
                        return;
                    }
                    
                    querySnapshot.forEach(doc => {
                        categories.push({
                            id: doc.id,
                            ...doc.data()
                        });
                        
                        const categoryItem = document.createElement('li');
                        categoryItem.innerHTML = `
                            <i class="fas fa-${getCategoryIcon(doc.data().name)}"></i>
                            <span>${doc.data().name}</span>
                        `;
                        
                        categoryItem.addEventListener('click', function() {
                            showQuestions(doc.id, doc.data().name);
                            toggleMenu();
                        });
                        
                        categorySideList.appendChild(categoryItem);
                    });
                })
                .catch(error => {
                    console.error("Error loading categories: ", error);
                    categorySideList.innerHTML = '<li class="error">Failed to load categories</li>';
                });
        } else {
            console.error("Firebase not initialized");
            categorySideList.innerHTML = '<li class="error">Database connection error</li>';
        }
    }
    
    function getCategoryIcon(categoryName) {
        const icons = {
            'football': 'football-ball',
            'soccer': 'futbol',
            'basketball': 'basketball-ball',
            'tennis': 'table-tennis',
            'swimming': 'swimmer',
            'baseball': 'baseball-ball',
            'golf': 'golf-ball',
            'hockey': 'hockey-puck'
        };
        
        const lowerName = categoryName.toLowerCase();
        return icons[lowerName] || 'question-circle';
    }
    
    function showQuestions(categoryId, categoryName) {
        currentCategory.textContent = categoryName;
        questionList.innerHTML = '<div class="loader">Loading questions...</div>';
        
        const category = categories.find(c => c.id === categoryId);
        
        if (!category || !category.questions || category.questions.length === 0) {
            questionList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <p>No questions available for this category</p>
                </div>
            `;
            return;
        }
        
        questionList.innerHTML = '';
        
        category.questions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            
            const questionHeader = document.createElement('div');
            questionHeader.className = 'question-header';
            questionHeader.innerHTML = `
                <h3>${index + 1}. ${question.question}</h3>
                <i class="fas fa-chevron-down"></i>
            `;
            
            const questionAnswer = document.createElement('div');
            questionAnswer.className = 'question-answer';
            questionAnswer.innerHTML = `<p>${question.answer}</p>`;
            
            questionItem.appendChild(questionHeader);
            questionItem.appendChild(questionAnswer);
            
            questionHeader.addEventListener('click', function() {
                questionAnswer.classList.toggle('show');
                questionItem.classList.toggle('active');
                
                // Rotate chevron icon
                const icon = this.querySelector('i');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
            
            questionList.appendChild(questionItem);
        });
    }
});
