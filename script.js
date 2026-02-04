document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');

    // Работа с избранным (LocalStorage)
    let favorites = JSON.parse(localStorage.getItem('myMedFavs')) || [];

    // Инициализация сердечек при загрузке
    const initFavs = () => {
        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            const btn = card.querySelector('.fav-btn');
            if (favorites.includes(id)) {
                btn.classList.add('active');
            }
        });
    };

    // Общая функция фильтрации
    const applyFilters = () => {
        const searchText = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-btn.active').getAttribute('data-filter');

        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            const category = card.getAttribute('data-category');
            const title = card.querySelector('h3').innerText.toLowerCase();
            const desc = card.querySelector('.desc').innerText.toLowerCase();

            // Проверка категории
            let categoryMatch = (activeCategory === 'all') ||
                                (activeCategory === category) ||
                                (activeCategory === 'favs' && favorites.includes(id));

            // Проверка поиска
            let searchMatch = title.includes(searchText) || desc.includes(searchText);

            if (categoryMatch && searchMatch) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    // Клик по сердечку
    cards.forEach(card => {
        const btn = card.querySelector('.fav-btn');
        const id = card.getAttribute('data-id');

        btn.addEventListener('click', () => {
            if (favorites.includes(id)) {
                favorites = favorites.filter(item => item !== id);
                btn.classList.remove('active');
            } else {
                favorites.push(id);
                btn.classList.add('active');
            }
            localStorage.setItem('myMedFavs', JSON.stringify(favorites));
           
            // Если мы во вкладке "Избранное", скрываем карточку сразу
            if (document.querySelector('.filter-btn.active').getAttribute('data-filter') === 'favs') {
                applyFilters();
            }
        });
    });

    // Обработка кнопок категорий
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });

    // Поиск при вводе
    searchInput.addEventListener('input', applyFilters);

    initFavs();
});