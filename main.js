function showList(apiUrl, listId, nameKey = 'displayName', imageKey = 'displayIcon') {
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById(listId);
      if (!list) return; // falls kein passendes Element existiert

      data.data.forEach(item => {
        const li = document.createElement('li');
        const name = item[nameKey] || 'Unbekannt';
        const img = item[imageKey] || '';

        li.innerHTML = `
          <strong>${name}</strong><br>
          ${img ? `<img src="${img}" alt="${name}" width="150"><br>` : ''}
        `;
        list.appendChild(li);
      });
    })
    .catch(err => console.error('Fehler:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('agents')) {
    showList('https://valorant-api.com/v1/agents?isPlayableCharacter=true', 'agents');
  }
  else if (path.includes('weapons')) {
    showList('https://valorant-api.com/v1/weapons', 'weapons');
  }
  else if (path.includes('maps')) {
    showList('https://valorant-api.com/v1/maps', 'maps', 'displayName', 'splash');
  }
  else if (path.includes('bundles')) {
    showList('https://valorant-api.com/v1/bundles', 'bundles');
  }
  else if (path.includes('gamemodes')) {
    showList('https://valorant-api.com/v1/gamemodes', 'gamemodes');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('agents')) {
    showList('https://valorant-api.com/v1/agents?isPlayableCharacter=true', 'agents');
  } else if (path.includes('weapons')) {
    showList('https://valorant-api.com/v1/weapons', 'weapons');
  } else if (path.includes('maps')) {
    showList('https://valorant-api.com/v1/maps', 'maps', 'displayName', 'splash');
  } else if (path.includes('bundles')) {
    showList('https://valorant-api.com/v1/bundles', 'bundles');
  } else if (path.includes('gamemodes')) {
    showList('https://valorant-api.com/v1/gamemodes', 'gamemodes');
  }

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});
