function showList(apiUrl, listId, nameKey = 'displayName', imageKey = 'displayIcon') {
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById(listId);
      if (!list) return;

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
  } else if (path.includes('weapons')) {
    showList('https://valorant-api.com/v1/weapons', 'weapons');
  } else if (path.includes('maps')) {
    showList('https://valorant-api.com/v1/maps', 'maps', 'displayName', 'splash');
  } else if (path.includes('bundles')) {
    showList('https://valorant-api.com/v1/bundles', 'bundles');
  } else if (path.includes('gamemodes')) {
    showList('https://valorant-api.com/v1/gamemodes', 'gamemodes');
  } else if (path.includes('comptiers')) {
  showCompTiers('comptiers');
}

  async function showCompTiers(listId) {
  const list = document.getElementById(listId);
  if (!list) return;

  try {
    const res = await fetch('https://valorant-api.com/v1/competitivetiers');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const sets = json?.data || [];
    if (!sets.length) {
      list.innerHTML = '<li><small>Keine Daten gefunden.</small></li>';
      return;
    }
    const latest = sets[sets.length - 1];
    const tiers = (latest.tiers || []).filter(t => (t.tier ?? 0) > 0);

    tiers.forEach(t => {
      const li = document.createElement('li');
      const name = t.tierName || `Tier ${t.tier}`;
      const img = t.largeIcon || t.smallIcon || '';

      li.innerHTML = `
        <strong>${name}</strong>
        ${img ? `<img src="${img}" alt="${name}" width="150"><br>` : ''}
        <small>Tier ${t.tier}</small>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<li><small>Fehler beim Laden der Tiers.</small></li>';
  }
}


  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});
