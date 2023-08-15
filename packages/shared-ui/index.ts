// index.ts
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const softwareCards = document.getElementById('softwareCards') as HTMLElement;
const loginFormContainer = document.getElementById(
  'loginFormContainer'
) as HTMLElement;
const loginForm = document.getElementById('loginForm') as HTMLFormElement;
const progressBar = document.getElementById('progressBar') as HTMLElement;
const notification = document.getElementById('notification') as HTMLElement;

let selectedSoftwareName: string | null = null;

interface Software {
  name: string;
  display_name: string;
  auth_type: string;
  button_display?: string; // Added a question mark for optional field
  state?: string; // Added a question mark for optional field
  oauth_url: string;
  created_at?: string;
}

const softwareData: Software[] = [
  {
    name: 'storehub',
    display_name: 'StoreHub',
    auth_type: 'modal',
    button_display: 'login',
    oauth_url: '',
    created_at: '2023-05-01',
  },
  {
    name: 'square',
    display_name: 'Square',
    auth_type: 'oauth',
    button_display: 'login',
    oauth_url: 'https://squareup.com/login?lang_code=en-us',
    created_at: '2023-05-01',
  },
  {
    name: 'papapoule',
    display_name: 'Papapoule',
    auth_type: 'modal',
    state: 'login',
    oauth_url: '',
  },
  {
    name: 'lightspeed',
    display_name: 'Lightspeed',
    auth_type: 'oauth',
    state: 'Request',
    oauth_url: '',
  },
  {
    name: 'ubereats',
    display_name: 'UberEATs',
    auth_type: 'oauth',
    state: 'Request',
    oauth_url: '',
  },
  {
    name: 'toast',
    display_name: 'Toast',
    auth_type: 'oauth',
    state: 'Request',
    oauth_url: '',
  },
  {
    name: 'deliveroo',
    display_name: 'Deliveroo',
    auth_type: 'oauth',
    state: 'Request',
    oauth_url: '',
  },
  {
    name: 'untill',
    display_name: 'Untill',
    auth_type: 'oauth',
    state: 'Request',
    oauth_url: '',
  },
  {
    name: 'booq',
    display_name: 'Booq',
    auth_type: 'oauth',
    state: 'Request',
    oauth_url: '',
  },
  {
    name: 'justeat',
    display_name: 'JustEat',
    auth_type: 'oauth',
    state: 'Request',
    oauth_url: '',
  },
];

function renderSoftwareCards(softwareList: Software[]) {
  softwareCards.innerHTML = '';

  softwareList.forEach((software) => {
    const card = document.createElement('div');
    card.className = 'software-card';

    card.innerHTML = `
      <h2>${software.display_name}</h2>
      <p>Auth Type: ${software.auth_type}</p>
      <button class="login-btn" data-name="${software.name}">Login</button>
    `;

    softwareCards.appendChild(card);

    const loginBtn = card.querySelector('.login-btn') as HTMLButtonElement;
    loginBtn.addEventListener('click', () => handleLoginClick(software.name));
  });
}

async function handleLoginClick(softwareName: string) {
  loginFormContainer.style.display = 'block';
  selectedSoftwareName = softwareName;
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (selectedSoftwareName) {
    const formData = new FormData(loginForm);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      showProgress();
      await fetch(`URL_TO_OWNER_SERVER/${selectedSoftwareName}`, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      hideProgress();
      showNotification('Login successful!');
      window.location.href = '/restaurants';
    } catch (error) {
      hideProgress();
      showNotification('Login failed. Please try again.');
    }
  }
});

function showProgress() {
  progressBar.style.display = 'block';
}

function hideProgress() {
  progressBar.style.display = 'none';
}

function showNotification(message: string) {
  notification.innerText = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredSoftware = softwareData.filter((software) =>
    software.display_name.toLowerCase().includes(searchTerm)
  );
  renderSoftwareCards(filteredSoftware);
});

renderSoftwareCards(softwareData);
