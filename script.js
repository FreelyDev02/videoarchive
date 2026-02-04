document.addEventListener('DOMContentLoaded', () => {
    // Элементы управления
    const btnLibrary = document.getElementById('btn-library');
    const btnCourses = document.getElementById('btn-courses');
    const librarySection = document.getElementById('library-section');
    const coursesSection = document.getElementById('courses-section');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');
    const courseCards = document.querySelectorAll('.course-card');

    // Избранное
    let favorites = JSON.parse(localStorage.getItem('medFavs')) || [];

    // --- ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК ---
    const switchMode = (mode) => {
        if (mode === 'library') {
            btnLibrary.classList.add('active');
            btnCourses.classList.remove('active');
            librarySection.style.display = 'block';
            coursesSection.style.display = 'none';
        } else {
            btnLibrary.classList.remove('active');
            btnCourses.classList.add('active');
            librarySection.style.display = 'none';
            coursesSection.style.display = 'block';
        }
    };

    btnLibrary.addEventListener('click', () => switchMode('library'));
    btnCourses.addEventListener('click', () => switchMode('courses'));

    // --- ЛОГИКА ФИЛЬТРАЦИИ ВИДЕО (МУЛЬТИ-ТЕГИ) ---
    // Текущий активный тег (по умолчанию 'all')
    let currentTag = 'all';

    const applyFilters = () => {
        const searchText = searchInput.value.toLowerCase();

        cards.forEach(card => {
            const cardTags = card.getAttribute('data-tags'); // Получаем строку "cardio anatomy"
            const cardId = card.getAttribute('data-id');
            const title = card.querySelector('h3').innerText.toLowerCase();

            // 1. Проверяем теги
            // includes позволяет найти 'cardio' внутри строки 'cardio anatomy'
            let isTagMatch = false;
            if (currentTag === 'all') {
                isTagMatch = true;
            } else if (currentTag === 'favs') {
                isTagMatch = favorites.includes(cardId);
            } else {
                // Самая важная строчка: проверяем наличие подстроки
                isTagMatch = cardTags.includes(currentTag);
            }

            // 2. Проверяем поиск
            const isSearchMatch = title.includes(searchText);

            // Показываем или скрываем
            if (isTagMatch && isSearchMatch) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    // Клик по кнопкам фильтров в библиотеке
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Визуальное переключение
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
           
            // Логика
            currentTag = btn.getAttribute('data-tag');
            applyFilters();
        });
    });

    // Поиск
    searchInput.addEventListener('input', applyFilters);

    // --- ЛОГИКА КУРСОВ ---
    // При клике на курс мы переходим в библиотеку и включаем нужный фильтр
    courseCards.forEach(cCard => {
        cCard.addEventListener('click', () => {
            const filterToApply = cCard.getAttribute('data-course-filter');
           
            // 1. Переключаемся на вкладку библиотеки
            switchMode('library');
           
            // 2. Устанавливаем текущий тег фильтрации
            currentTag = filterToApply;
           
            // 3. Сбрасываем визуальные кнопки фильтров (так как курс может быть скрытым тегом)
            filterBtns.forEach(b => b.classList.remove('active'));
           
            // 4. Применяем фильтр
            applyFilters();

            // Опционально: очищаем поиск
            searchInput.value = '';
        });
    });

    // --- ЛОГИКА ИЗБРАННОГО ---
    const initFavs = () => {
        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            const btn = card.querySelector('.fav-btn');
           
            if (favorites.includes(id)) btn.classList.add('active');

            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Чтобы клик не срабатывал на карточку
                if (favorites.includes(id)) {
                    favorites = favorites.filter(f => f !== id);
                    btn.classList.remove('active');
                } else {
                    favorites.push(id);
                    btn.classList.add('active');
                }
                localStorage.setItem('medFavs', JSON.stringify(favorites));
               
                if (currentTag === 'favs') applyFilters();
            });
        });
    };

    initFavs();
});