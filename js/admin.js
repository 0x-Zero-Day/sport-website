document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const themeToggle = document.getElementById('theme-toggle');
    const backBtn = document.getElementById('back-btn');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const confirmCancel = document.getElementById('confirm-cancel');
    const confirmOk = document.getElementById('confirm-ok');
    const loginError = document.getElementById('login-error');

    // State variables
    let currentCategoryId = '';
    let currentQuestionId = '';
    let confirmCallback = null;
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

    // Theme toggle
    themeToggle.addEventListener('click', function() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        initTheme();
    });

    // Back button functionality
    backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'index.html';
    });

    // Check auth state
    auth.onAuthStateChanged(user => {
        const loginContainer = document.getElementById('login-container');
        const dashboardContainer = document.getElementById('dashboard-container');
        const logoutBtn = document.getElementById('logout-btn');
        const adminLogo = document.getElementById('admin-logo');

        if (user) {
            // User is signed in
            loginContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            logoutBtn.style.display = 'block';
            adminLogo.style.display = 'block';
            backBtn.style.display = 'none';
            
            initAdminFunctionality();
        } else {
            // No user is signed in
            loginContainer.style.display = 'block';
            dashboardContainer.style.display = 'none';
            logoutBtn.style.display = 'none';
            adminLogo.style.display = 'none';
            backBtn.style.display = 'flex';
            loginError.textContent = '';
        }
    });

    function initAdminFunctionality() {
        // Get admin elements
        const logoutBtn = document.getElementById('logout-btn');
        const sidebarItems = document.querySelectorAll('.admin-sidebar li');
        const adminSections = document.querySelectorAll('.admin-section');
        const categoryList = document.getElementById('admin-category-list');
        const addCategoryBtn = document.getElementById('add-category-btn');
        const categoryForm = document.getElementById('category-form');
        const questionList = document.getElementById('admin-question-list');
        const addQuestionBtn = document.getElementById('add-question-btn');
        const questionForm = document.getElementById('question-form');
        const questionCategorySelect = document.getElementById('question-category-select');

        // Logout button
        logoutBtn.addEventListener('click', function() {
            auth.signOut()
                .then(() => window.location.href = 'index.html')
                .catch(error => console.error("Logout error:", error));
        });

        // Sidebar navigation
        sidebarItems.forEach(item => {
            item.addEventListener('click', function() {
                sidebarItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                adminSections.forEach(sec => {
                    sec.style.display = sec.id === `${this.getAttribute('data-section')}-section` ? 'block' : 'none';
                });
            });
        });

        // Load initial data
        loadCategories();
        loadCategorySelect();

        // Category functions
        function loadCategories() {
            categoryList.innerHTML = '<div class="loader">Loading categories...</div>';
            
            db.collection('categories').get().then(querySnapshot => {
                categoryList.innerHTML = '';
                
                if (querySnapshot.empty) {
                    categoryList.innerHTML = '<div class="no-categories">No categories found.</div>';
                    return;
                }
                
                querySnapshot.forEach(doc => {
                    categoryList.appendChild(createAdminCategoryCard(doc.id, doc.data()));
                });
            }).catch(error => {
                console.error("Error loading categories:", error);
                categoryList.innerHTML = '<div class="error">Failed to load categories.</div>';
            });
        }

        function createAdminCategoryCard(id, category) {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <h4>${category.name}</h4>
                <p>${category.questions?.length || 0} questions</p>
                <div class="category-actions">
                    <button class="btn edit-category" data-id="${id}">Edit</button>
                    <button class="btn btn-danger delete-category" data-id="${id}">Delete</button>
                </div>
            `;
            return card;
        }

        // Question functions
        function loadCategorySelect() {
            questionCategorySelect.innerHTML = '<option value="">Select a category</option>';
            
            db.collection('categories').get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = doc.data().name;
                    questionCategorySelect.appendChild(option);
                });
            }).catch(error => console.error("Error loading categories:", error));
        }

        function loadQuestions(categoryId) {
            questionList.innerHTML = '<div class="loader">Loading questions...</div>';
            
            db.collection('categories').doc(categoryId).get().then(doc => {
                questionList.innerHTML = '';
                
                if (!doc.exists || !doc.data().questions) {
                    questionList.innerHTML = '<div class="no-questions">No questions found.</div>';
                    return;
                }
                
                doc.data().questions.forEach((question, index) => {
                    questionList.appendChild(createAdminQuestionItem(question, index, categoryId));
                });
            }).catch(error => {
                console.error("Error loading questions:", error);
                questionList.innerHTML = '<div class="error">Failed to load questions.</div>';
            });
        }

        function createAdminQuestionItem(question, index, categoryId) {
            const item = document.createElement('div');
            item.className = 'question-item';
            item.innerHTML = `
                <h4>${question.question}</h4>
                <p>${question.answer}</p>
                <div class="question-actions">
                    <button class="btn edit-question" data-category="${categoryId}" data-index="${index}">Edit</button>
                    <button class="btn btn-danger delete-question" data-category="${categoryId}" data-index="${index}">Delete</button>
                </div>
            `;
            return item;
        }

        // Event listeners
        addCategoryBtn.addEventListener('click', () => {
            document.getElementById('modal-category-title').textContent = 'Add New Category';
            document.getElementById('category-id').value = '';
            document.getElementById('category-name').value = '';
            document.getElementById('category-modal').style.display = 'flex';
        });

        categoryForm.addEventListener('submit', e => {
            e.preventDefault();
            const id = document.getElementById('category-id').value;
            const name = document.getElementById('category-name').value;
            
            const operation = id 
                ? db.collection('categories').doc(id).update({ name })
                : db.collection('categories').add({ name, questions: [] });
            
            operation.then(() => {
                closeModal(document.getElementById('category-modal'));
                loadCategories();
                loadCategorySelect();
            }).catch(error => console.error("Error saving category:", error));
        });

        addQuestionBtn.addEventListener('click', () => {
            if (!currentCategoryId) return;
            document.getElementById('modal-question-title').textContent = 'Add New Question';
            document.getElementById('question-id').value = '';
            document.getElementById('question-category-id').value = currentCategoryId;
            document.getElementById('question-text').value = '';
            document.getElementById('question-answer').value = '';
            document.getElementById('question-modal').style.display = 'flex';
        });

        questionForm.addEventListener('submit', e => {
            e.preventDefault();
            const id = document.getElementById('question-id').value;
            const categoryId = document.getElementById('question-category-id').value;
            const questionData = {
                question: document.getElementById('question-text').value,
                answer: document.getElementById('question-answer').value,
                id: id || Date.now().toString()
            };

            db.collection('categories').doc(categoryId).get().then(doc => {
                const questions = doc.data().questions || [];
                const questionIndex = id ? questions.findIndex(q => q.id === id) : -1;
                
                if (questionIndex >= 0) {
                    questions[questionIndex] = questionData;
                } else {
                    questions.push(questionData);
                }

                return db.collection('categories').doc(categoryId).update({ questions });
            }).then(() => {
                closeModal(document.getElementById('question-modal'));
                loadQuestions(categoryId);
            }).catch(error => console.error("Error saving question:", error));
        });

        questionCategorySelect.addEventListener('change', e => {
            currentCategoryId = e.target.value;
            addQuestionBtn.disabled = !currentCategoryId;
            currentCategoryId ? loadQuestions(currentCategoryId) : 
                questionList.innerHTML = '<div class="select-category">Select a category</div>';
        });

        // Event delegation for edit/delete
        categoryList.addEventListener('click', e => {
            if (e.target.classList.contains('edit-category')) {
                const id = e.target.dataset.id;
                db.collection('categories').doc(id).get().then(doc => {
                    document.getElementById('modal-category-title').textContent = 'Edit Category';
                    document.getElementById('category-id').value = id;
                    document.getElementById('category-name').value = doc.data().name;
                    document.getElementById('category-modal').style.display = 'flex';
                });
            }
            else if (e.target.classList.contains('delete-category')) {
                const id = e.target.dataset.id;
                showConfirmModal('Delete this category?', () => {
                    db.collection('categories').doc(id).delete()
                        .then(() => {
                            loadCategories();
                            loadCategorySelect();
                            if (currentCategoryId === id) {
                                currentCategoryId = '';
                                questionCategorySelect.value = '';
                                questionList.innerHTML = '<div class="select-category">Select a category</div>';
                            }
                        })
                        .catch(error => console.error("Error deleting category:", error));
                });
            }
        });

        questionList.addEventListener('click', e => {
            if (e.target.classList.contains('edit-question')) {
                const categoryId = e.target.dataset.category;
                const index = e.target.dataset.index;
                db.collection('categories').doc(categoryId).get().then(doc => {
                    const question = doc.data().questions[index];
                    document.getElementById('modal-question-title').textContent = 'Edit Question';
                    document.getElementById('question-id').value = question.id;
                    document.getElementById('question-category-id').value = categoryId;
                    document.getElementById('question-text').value = question.question;
                    document.getElementById('question-answer').value = question.answer;
                    document.getElementById('question-modal').style.display = 'flex';
                });
            }
            else if (e.target.classList.contains('delete-question')) {
                const categoryId = e.target.dataset.category;
                const index = e.target.dataset.index;
                showConfirmModal('Delete this question?', () => {
                    db.collection('categories').doc(categoryId).get().then(doc => {
                        const questions = doc.data().questions.filter((_, i) => i != index);
                        return db.collection('categories').doc(categoryId).update({ questions });
                    }).then(() => loadQuestions(categoryId))
                      .catch(error => console.error("Error deleting question:", error));
                });
            }
        });
    }

    // Modal functions
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
    });

    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) closeModal(e.target);
    });

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    confirmCancel.addEventListener('click', () => closeModal(document.getElementById('confirm-modal')));
    confirmOk.addEventListener('click', () => {
        confirmCallback?.();
        closeModal(document.getElementById('confirm-modal'));
    });

    function showConfirmModal(message, callback) {
        document.getElementById('confirm-message').textContent = message;
        confirmCallback = callback;
        document.getElementById('confirm-modal').style.display = 'flex';
    }

    // Login form
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => loginError.textContent = error.message);
    });
});
