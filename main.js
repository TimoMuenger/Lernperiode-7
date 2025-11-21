document.addEventListener('DOMContentLoaded', async () => {
  console.log('JS wurde geladen');

  const listAgents = document.getElementById('agents');
  const listWeapons = document.getElementById('weapons');
  const listMaps = document.getElementById('maps');
  const listBundles = document.getElementById('bundles');
  const listGamemodes = document.getElementById('gamemodes');
  const listCompTiers = document.getElementById('comptiers');

  const globalSearch = document.getElementById('globalSearch');

  const agentSort = document.getElementById('agentSort');
  const agentRoleFilter = document.getElementById('agentRoleFilter');
  const weaponSort = document.getElementById('weaponSort');

  const allLists = [
    listAgents,
    listWeapons,
    listMaps,
    listBundles,
    listGamemodes,
    listCompTiers
  ].filter(Boolean);

  if (globalSearch && allLists.length > 0) {
    globalSearch.addEventListener('input', () => {
      const term = globalSearch.value.toLowerCase();

      allLists.forEach(list => {
        Array.from(list.children).forEach(li => {
          const text = li.textContent.toLowerCase();
          li.style.display = text.includes(term) ? '' : 'none';
        });
      });
    });
  }

  let agentsData = [];
  let weaponsData = [];

  if (listAgents) {
    const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
    const json = await res.json();
    agentsData = json.data || [];

    function renderAgents() {
      const sortBy = agentSort ? agentSort.value : 'name';
      const roleFilter = agentRoleFilter ? agentRoleFilter.value : 'all';

      let arr = agentsData.slice();

      if (roleFilter !== 'all') {
        arr = arr.filter(a => a.role && a.role.displayName === roleFilter);
      }

      if (sortBy === 'name') {
        arr.sort((a, b) => a.displayName.localeCompare(b.displayName));
      } else if (sortBy === 'role') {
        arr.sort((a, b) => {
          const rA = a.role ? a.role.displayName : '';
          const rB = b.role ? b.role.displayName : '';
          const byRole = rA.localeCompare(rB);
          if (byRole !== 0) return byRole;
          return a.displayName.localeCompare(b.displayName);
        });
      }

      listAgents.innerHTML = '';

      arr.forEach(agent => {
        const li = document.createElement('li');
        li.style.cursor = 'pointer';

        const name = agent.displayName || 'Unbekannt';
        const img = agent.displayIcon || '';

        li.innerHTML = `
          <strong>${name}</strong><br>
          ${img ? `<img src="${img}" alt="${name}" width="150"><br>` : ''}
        `;

        li.addEventListener('click', () => {
          const existing = li.querySelector('.agent-extra');
          if (existing) {
            existing.remove();
            return;
          }

          const portrait = agent.fullPortrait || agent.displayIcon || '';
          const desc = agent.description || 'Keine Beschreibung vorhanden.';
          const roleName = agent.role && agent.role.displayName ? agent.role.displayName : 'Keine Rolle';
          const abilities = (agent.abilities || [])
            .filter(a => a.displayName)
            .map(a => a.displayName)
            .join(', ');

          const extra = document.createElement('div');
          extra.className = 'agent-extra';
          extra.innerHTML = `
            <hr>
            ${portrait ? `<img src="${portrait}" alt="${name}" width="250"><br>` : ''}
            <p>${desc}</p>
            <p><strong>Rolle:</strong> ${roleName}</p>
            <p><strong>Fähigkeiten:</strong> ${abilities}</p>
          `;

          li.appendChild(extra);
        });

        listAgents.appendChild(li);
      });
    }

    if (agentSort) agentSort.addEventListener('change', renderAgents);
    if (agentRoleFilter) agentRoleFilter.addEventListener('change', renderAgents);

    renderAgents();
  }

  if (listWeapons) {
    const res = await fetch('https://valorant-api.com/v1/weapons');
    const json = await res.json();
    weaponsData = json.data || [];

    function renderWeapons() {
      const sortBy = weaponSort ? weaponSort.value : 'name';

      let arr = weaponsData.slice();

      if (sortBy === 'name') {
        arr.sort((a, b) => a.displayName.localeCompare(b.displayName));
      } else if (sortBy === 'price') {
        arr.sort((a, b) => {
          const costA = a.shopData && typeof a.shopData.cost === 'number' ? a.shopData.cost : Infinity;
          const costB = b.shopData && typeof b.shopData.cost === 'number' ? b.shopData.cost : Infinity;
          if (costA === costB) return a.displayName.localeCompare(b.displayName);
          return costA - costB;
        });
      }

      listWeapons.innerHTML = '';

      arr.forEach(weapon => {
        const li = document.createElement('li');
        li.style.cursor = 'pointer';

        const name = weapon.displayName || 'Unbekannt';
        const img = weapon.displayIcon || '';

        li.innerHTML = `
          <strong>${name}</strong><br>
          ${img ? `<img src="${img}" alt="${name}" width="150"><br>` : ''}
        `;

        li.addEventListener('click', () => {
          const existing = li.querySelector('.weapon-extra');
          if (existing) {
            existing.remove();
            return;
          }

          const category = weapon.shopData && weapon.shopData.category
            ? weapon.shopData.category
            : weapon.category || 'Unbekannte Kategorie';

          const cost = weapon.shopData && typeof weapon.shopData.cost === 'number'
            ? weapon.shopData.cost
            : null;

          const stats = weapon.weaponStats || {};

          const extra = document.createElement('div');
          extra.className = 'weapon-extra';
          extra.innerHTML = `
            <hr>
            <p><strong>Kategorie:</strong> ${category}</p>
            ${cost !== null ? `<p><strong>Preis:</strong> ${cost} Credits</p>` : ''}
            ${stats.fireRate ? `<p><strong>Fire Rate:</strong> ${stats.fireRate}</p>` : ''}
            ${stats.magazineSize ? `<p><strong>Magazin:</strong> ${stats.magazineSize} Schuss</p>` : ''}
            ${stats.reloadTimeSeconds ? `<p><strong>Reload:</strong> ${stats.reloadTimeSeconds}s</p>` : ''}
          `;

          li.appendChild(extra);
        });

        listWeapons.appendChild(li);
      });
    }

    if (weaponSort) weaponSort.addEventListener('change', renderWeapons);

    renderWeapons();
  }

  if (listMaps) {
    fetch('https://valorant-api.com/v1/maps')
      .then(res => res.json())
      .then(data => {
        data.data.forEach(map => {
          const li = document.createElement('li');
          li.style.cursor = 'pointer';

          const name = map.displayName || 'Unbekannte Map';
          const splash = map.splash || '';
          const minimap = map.displayIcon || map.listViewIcon || '';
          const coords = map.coordinates || '';

          li.innerHTML = `
            <strong>${name}</strong><br>
            ${splash ? `<img src="${splash}" width="250"><br>` : ''}
          `;

          li.addEventListener('click', () => {
            const existing = li.querySelector('.map-extra');
            if (existing) {
              existing.remove();
              return;
            }

            const extra = document.createElement('div');
            extra.className = 'map-extra';
            extra.innerHTML = `
              <hr>
              ${minimap ? `<img src="${minimap}" alt="${name} Minimap" width="250"><br>` : ''}
              ${coords ? `<p><strong>Koordinaten:</strong> ${coords}</p>` : ''}
            `;

            li.appendChild(extra);
          });

          listMaps.appendChild(li);
        });
      });
  }

  if (listBundles) {
    fetch('https://valorant-api.com/v1/bundles')
      .then(res => res.json())
      .then(data => {
        data.data.forEach(bundle => {
          const li = document.createElement('li');
          li.innerHTML = `
            <strong>${bundle.displayName}</strong><br>
            ${bundle.displayIcon ? `<img src="${bundle.displayIcon}" width="200"><br>` : ''}
          `;
          listBundles.appendChild(li);
        });
      });
  }

  if (listGamemodes) {
    fetch('https://valorant-api.com/v1/gamemodes')
      .then(res => res.json())
      .then(data => {
        data.data.forEach(mode => {
          const li = document.createElement('li');
          const name = mode.displayName || 'Unbekannter Modus';
          const icon = mode.displayIcon || '';
          li.innerHTML = `
            <strong>${name}</strong><br>
            ${icon ? `<img src="${icon}" width="150"><br>` : ''}
          `;
          listGamemodes.appendChild(li);
        });
      });
  }

  if (listCompTiers) {
    const res = await fetch('https://valorant-api.com/v1/competitivetiers');
    const json = await res.json();

    const sets = json.data || [];
    const latest = sets[sets.length - 1];
    const tiers = latest.tiers.filter(t => t.tier > 0);

    tiers.forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${t.tierName}</strong><br>
        ${t.largeIcon ? `<img src="${t.largeIcon}" width="150"><br>` : ''}
        <small>Tier ${t.tier}</small>
      `;
      listCompTiers.appendChild(li);
    });
  }

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});
