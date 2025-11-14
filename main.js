document.addEventListener('DOMContentLoaded', async () => {
  console.log('JS wurde geladen');

  const listAgents = document.getElementById('agents');
  const listWeapons = document.getElementById('weapons');
  const listMaps = document.getElementById('maps');
  const listBundles = document.getElementById('bundles');
  const listGamemodes = document.getElementById('gamemodes');
  const listCompTiers = document.getElementById('comptiers');

  const globalSearch = document.getElementById('globalSearch');

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


  if (listAgents) {
    console.log("Agents-Seite erkannt.");

    const res = await fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true');
    const json = await res.json();
    const agents = json.data || [];

    agents.forEach(agent => {
      const li = document.createElement('li');
      li.style.cursor = 'pointer';

      const name = agent.displayName || 'Unbekannt';
      const img = agent.displayIcon || '';

      li.innerHTML = `
        <strong>${name}</strong><br>
        ${img ? `<img src="${img}" alt="${name}" width="150"><br>` : ''}
      `;
      li.addEventListener('click', () => {
        console.log('Agent geklickt:', name);

        const existing = li.querySelector('.agent-extra');
        if (existing) {
          existing.remove();
          return;
        }

        const portrait = agent.fullPortrait || agent.displayIcon || '';
        const desc = agent.description || 'Keine Beschreibung vorhanden.';
        const roleName = agent.role?.displayName || 'Keine Rolle';
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

if (listWeapons) {
  fetch("https://valorant-api.com/v1/weapons")
    .then(res => res.json())
    .then(data => {
      data.data.forEach(weapon => {
        const li = document.createElement("li");
        li.style.cursor = "pointer";

        const name = weapon.displayName || "Unbekannt";
        const img = weapon.displayIcon || "";

        li.innerHTML = `
          <strong>${name}</strong><br>
          ${img ? `<img src="${img}" width="150"><br>` : ""}
        `;

        li.addEventListener("click", () => {
          const existing = li.querySelector(".weapon-extra");
          if (existing) {
            existing.remove();
            return;
          }

          const category =
            weapon.shopData?.category || weapon.category || "Unbekannte Kategorie";
          const cost =
            weapon.shopData && typeof weapon.shopData.cost === "number"
              ? weapon.shopData.cost
              : null;
          const stats = weapon.weaponStats || {};

          const extra = document.createElement("div");
          extra.className = "weapon-extra";
          extra.innerHTML = `
            <hr>
            <p><strong>Kategorie:</strong> ${category}</p>
            ${cost !== null ? `<p><strong>Preis:</strong> ${cost} Credits</p>` : ""}
            ${stats.fireRate ? `<p><strong>Fire Rate:</strong> ${stats.fireRate}</p>` : ""}
            ${stats.magazineSize ? `<p><strong>Magazin:</strong> ${stats.magazineSize} Schuss</p>` : ""}
            ${
              stats.reloadTimeSeconds
                ? `<p><strong>Reload:</strong> ${stats.reloadTimeSeconds}s</p>`
                : ""
            }
          `;

          li.appendChild(extra);
        });

        listWeapons.appendChild(li);
      });
    });
}


  if (listMaps) {
  fetch("https://valorant-api.com/v1/maps")
    .then(res => res.json())
    .then(data => {
      data.data.forEach(map => {
        const li = document.createElement("li");
        li.style.cursor = "pointer";

        const name = map.displayName || "Unbekannte Map";
        const splash = map.splash || "";
        const minimap = map.displayIcon || map.listViewIcon || "";
        const coords = map.coordinates || "";

        li.innerHTML = `
          <strong>${name}</strong><br>
          ${splash ? `<img src="${splash}" width="250"><br>` : ""}
        `;

        li.addEventListener("click", () => {
          console.log("Map geklickt:", name);

          const existing = li.querySelector(".map-extra");
          if (existing) {
            existing.remove();
            return;
          }

          const extra = document.createElement("div");
          extra.className = "map-extra";
          extra.innerHTML = `
            <hr>
            ${minimap ? `<img src="${minimap}" alt="${name} Minimap" width="250"><br>` : ""}
            ${coords ? `<p><strong>Koordinaten:</strong> ${coords}</p>` : ""}
          `;

          li.appendChild(extra);
        });

        listMaps.appendChild(li);
      });
    });
}

if (listBundles) {
  fetch("https://valorant-api.com/v1/bundles")
    .then(res => res.json())
    .then(data => {
      data.data.forEach(bundle => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${bundle.displayName}</strong><br>
          ${bundle.displayIcon ? `<img src="${bundle.displayIcon}" width="200"><br>` : ""}
        `;
        listBundles.appendChild(li);
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
        ${t.largeIcon ? `<img src="${t.largeIcon}" width="150"><br>` : ""}
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
