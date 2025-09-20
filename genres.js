const genreContainer = document.getElementById('genre-container');

// ژانرهای موسیقی ایران
const genres = ['پاپ', 'سنتی', 'رپ', 'راک'];

genres.forEach(g => {
  const btn = document.createElement('button');
  btn.className = 'genre-btn';
  btn.innerText = g;
  btn.addEventListener('click', () => {
    window.location.href = `singers.html?genre=${encodeURIComponent(g)}`;
  });
  genreContainer.appendChild(btn);
});
