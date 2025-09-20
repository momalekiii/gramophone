const container = document.getElementById('main-container');
const genreFilter = document.getElementById('genre-filter');
const searchInput = document.getElementById('search-input');
const MAX_LOAD = 20;

let singerList = [];
let filteredList = [];
let currentIndex = 0;
let allGenres = new Set();

// Fetch list of Persian singers from Wikipedia category
async function fetchWikipediaSingers() {
  let allSingers = [];
  let continueToken = '';

  try {
    do {
      const res = await fetch(`https://fa.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=رده:خواننده‌های_ایرانی&cmlimit=50&format=json&origin=*&cmcontinue=${continueToken}`);
      const data = await res.json();
      const members = data.query.categorymembers.map(m => m.title);
      allSingers = allSingers.concat(members);
      continueToken = data.continue ? data.continue.cmcontinue : '';
    } while (continueToken);
    return allSingers;
  } catch (e) {
    console.error('Error fetching singers:', e);
    return [];
  }
}

// Fetch image and genre of singer from Wikipedia
async function fetchSingerDetails(name) {
  let img = `https://via.placeholder.com/80x80?text=${encodeURIComponent(name)}`;
  let genre = 'نامشخص';
  try {
    const res = await fetch(`https://fa.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages|categories&format=json&pithumbsize=300&origin=*`);
    const data = await res.json();
    const pages = data.query.pages;
    for (const key in pages) {
      if (pages[key].thumbnail) img = pages[key].thumbnail.source;
      if (pages[key].categories) {
        const catNames = pages[key].categories.map(c => c.title.replace('رده:', ''));
        if(catNames.length) {
          genre = catNames[0];
          catNames.forEach(g => allGenres.add(g));
        }
      }
    }
  } catch(e) {}
  return { name, img, genre };
}

// Populate genre filter dropdown dynamically
function populateGenreFilter() {
  genreFilter.innerHTML = '<option value="all">همه</option>';
  Array.from(allGenres).sort().forEach(g => {
    const option = document.createElement('option');
    option.value = g;
    option.innerText = g;
    genreFilter.appendChild(option);
  });
}

// Load next batch of singers
async function loadSingersBatch() {
  const list = filteredList.length ? filteredList : singerList;
  const batch = list.slice(currentIndex, currentIndex + MAX_LOAD);

  // Add placeholders
  batch.forEach(() => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = '<div class="avatar"></div><div>در حال بارگذاری...</div>';
    container.appendChild(div);
  });

  for (let i = 0; i < batch.length; i++) {
    const singer = batch[i];
    const details = await fetchSingerDetails(singer.name);
    singer.img = details.img;
    singer.genre = details.genre;

    const card = container.children[currentIndex + i];
    card.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'avatar';
    img.src = singer.img;
    const nameDiv = document.createElement('div');
    nameDiv.innerText = `${singer.name} (${singer.genre})`;
    card.appendChild(img);
    card.appendChild(nameDiv);
  }

  currentIndex += MAX_LOAD;

  // Populate genre filter after first batch
  if(currentIndex === MAX_LOAD) populateGenreFilter();
}

// Infinite scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    if (currentIndex < (filteredList.length ? filteredList.length : singerList.length)) {
      loadSingersBatch();
    }
  }
});

// Genre filter change
genreFilter.addEventListener('change', () => {
  const genre = genreFilter.value;
  container.innerHTML = '';
  currentIndex = 0;
  filteredList = genre === 'all' ? [] : singerList.filter(s => s.genre === genre);
  loadSingersBatch();
});

// Live search
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  container.innerHTML = '';
  currentIndex = 0;
  if(query) {
    filteredList = singerList.filter(s => s.name.toLowerCase().includes(query));
  } else {
    filteredList = [];
  }
  loadSingersBatch();
});

// Initialize
async function init() {
  container.innerHTML = '<div class="genre-title">در حال بارگذاری خواننده‌ها...</div>';
  const singers = await fetchWikipediaSingers();
  singerList = singers.map(name => ({ name, genre: 'نامشخص', img: '' }));
  container.innerHTML = '';
  loadSingersBatch();
}

init();
