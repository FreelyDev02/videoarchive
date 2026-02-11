document.addEventListener('DOMContentLoaded', () => {
    // --- КОНФИГУРАЦИЯ ---
    const ITEMS_PER_PAGE = 6; // Сколько видео грузить за раз
    let allVideosData = [];   // Здесь будет лежать весь JSON
    let filteredVideos = [];  // Здесь то, что отобрано фильтром
    let displayedCount = 0;   // Сколько уже показали на экране

    // Элементы
    const grid = document.getElementById('videoGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
   
    // Избранное
    let favorites = JSON.parse(localStorage.getItem('medFavs')) || [];

    // 1. ЗАГРУЗКА ДАННЫХ
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allVideosData = data;
            applyFilters(); // Первый запуск
        })
        .catch(err => console.error('Ошибка загрузки видео:', err));

    // 2. ФУНКЦИЯ ОТРИСОВКИ КАРТОЧКИ
    const createCardHTML = (video) => {
        const isFav = favorites.includes(video.id) ? 'active' : '';
        // Генерируем HTML для тегов
        const tagsHTML = video.tags.map(t => `<span class="tag">${t}</span>`).join('');
       
        return `
            <div class="card" data-id="${video.id}">
                <div class="video-box">
                    <iframe src="${video.iframeUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>
                </div>
                <div class="card-content">
                    <div class="card-top">
                        <div class="tags-list">${tagsHTML}</div>
                        <button class="fav-btn ${isFav}" onclick="toggleFav('${video.id}', this)">❤</button>
                    </div>
                    <h3>${video.title}</h3>
                    <p class="desc">${video.desc}</p>
                </div>
            </div>
        `;
    };

    // 3. ЛОГИКА ФИЛЬТРАЦИИ
    let currentTag = 'all';

    window.applyFilters = () => {
        const searchText = searchInput.value.toLowerCase();
       
        // Фильтруем исходный массив данных
        filteredVideos = allVideosData.filter(video => {
            // Проверка тегов
            let tagMatch = false;
            if (currentTag === 'all') tagMatch = true;
            else if (currentTag === 'favs') tagMatch = favorites.includes(video.id);
            else tagMatch = video.tags.includes(currentTag);

            // Проверка поиска
            const titleMatch = video.title.toLowerCase().includes(searchText);

            return tagMatch && titleMatch;
        });

        // Сброс счетчиков перед новой отрисовкой
        grid.innerHTML = '';
        displayedCount = 0;
        loadMoreBtn.style.display = 'none';

        // Загружаем первую порцию
        loadMoreVideos();
    };

    // 4. ЛОГИКА "ПОКАЗАТЬ ЕЩЕ" (ПАГИНАЦИЯ)
    const loadMoreVideos = () => {
        const total = filteredVideos.length;
        const nextBatch = filteredVideos.slice(displayedCount, displayedCount + ITEMS_PER_PAGE);

        if (nextBatch.length === 0 && total === 0) {
            grid.innerHTML = '<p style="padding:20px; text-align:center;">Видео не найдено</p>';
            return;
        }

        nextBatch.forEach(video => {
            const div = document.createElement('div');
            // Обертка нужна, чтобы вставить HTML строкой, но лучше создавать элементы
            div.innerHTML = createCardHTML(video);
            // Достаем саму карточку из обертки
            grid.appendChild(div.firstElementChild);
        });

        displayedCount += nextBatch.length;

        // Если показали не всё — включаем кнопку
        if (displayedCount < total) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    };

    loadMoreBtn.addEventListener('click', loadMoreVideos);

    // 5. ОБРАБОТЧИКИ ФИЛЬТРОВ И ПОИСКА
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTag = btn.getAttribute('data-tag');
            applyFilters();
        });
    });

    searchInput.addEventListener('input', applyFilters);

    // 6. ИЗБРАННОЕ (глобальная функция, чтобы работала из HTML строки)
    window.toggleFav = (id, btn) => {
        if (favorites.includes(id)) {
            favorites = favorites.filter(f => f !== id);
            btn.classList.remove('active');
        } else {
            favorites.push(id);
            btn.classList.add('active');
        }
        localStorage.setItem('medFavs', JSON.stringify(favorites));
       
        // Если мы сейчас на вкладке "Избранное", надо обновить список
        if (currentTag === 'favs') applyFilters();
    };

    // --- ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК (БИБЛИОТЕКА / КУРСЫ) ---
    const btnLibrary = document.getElementById('btn-library');
    const btnCourses = document.getElementById('btn-courses');
    const libSection = document.getElementById('library-section');
    const coursesSection = document.getElementById('courses-section');

    btnLibrary.addEventListener('click', () => {
        btnLibrary.classList.add('active');
        btnCourses.classList.remove('active');
        libSection.style.display = 'block';
        coursesSection.style.display = 'none';
    });

    btnCourses.addEventListener('click', () => {
        btnLibrary.classList.remove('active');
        btnCourses.classList.add('active');
        libSection.style.display = 'none';
        coursesSection.style.display = 'block';
    });

    // Клик по карточке курса
    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const filter = card.getAttribute('data-course-filter');
            btnLibrary.click(); // Переход на вкладку
           
            // Активируем нужный фильтр визуально и логически
            filterBtns.forEach(b => {
                if(b.getAttribute('data-tag') === filter) {
                    b.click();
                } else {
                    b.classList.remove('active');
                }
            });
            // Если кнопки фильтра нет (скрытый тег), просто применяем логику
            if (!document.querySelector(`.filter-btn[data-tag="${filter}"]`)) {
                currentTag = filter;
                applyFilters();
            }
        });
    });

});
