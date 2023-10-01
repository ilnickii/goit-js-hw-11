import axios from 'axios';
import Notiflix from 'notiflix';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const endMessage = document.querySelector('.end-message');
const notification = document.querySelector('.notification');
let page = 1;
let searchQuery = '';
let totalHits = 0;
let totalPages = 0;

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    gallery.innerHTML = '';
    page = 1;
    searchQuery = e.target.searchQuery.value.trim();
    if (searchQuery !== '') {
        hideEndMessage(); 
        await fetchImages();
        if (totalHits !== 0) {
            Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        }
    } else {
        Notiflix.Notify.warning('Please enter a search query.');
    }
});

loadMoreButton.addEventListener('click', async () => {
    page++;
    await fetchImages();
    hideEndMessage();
});

function hideEndMessage() {
    endMessage.style.display = 'none';
}

async function fetchImages() {
    const apiKey = '39762348-dd965ab637a7eabeb6914620f';
    const perPage = 40;
    const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

    try {
        Notiflix.Loading.pulse('Loading...');

        const response = await axios.get(apiUrl);
        const data = response.data;

        Notiflix.Loading.remove();

        if (data.totalHits === 0) {
            notification.textContent = 'Sorry, there are no images matching your search query. Please try again.';
            loadMoreButton.style.display = 'none';
        } else {
            totalHits = data.totalHits;
            totalPages = Math.ceil(totalHits / perPage);

            data.hits.forEach((image) => {
                const card = document.createElement('div');
                card.classList.add('photo-card');
                card.innerHTML = `
                    <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
                    <div class="info">
                        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
                        <p class="info-item"><b>Views:</b> ${image.views}</p>
                        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
                        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
                    </div>
                `;
                gallery.appendChild(card);
            });

            if (page < totalPages) {
                loadMoreButton.style.display = 'block';
            } else {
                loadMoreButton.style.display = 'none';
                endMessage.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        Notiflix.Notify.failure('Error fetching images. Please try again later.');
    }
}