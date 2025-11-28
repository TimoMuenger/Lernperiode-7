const weaponSprayImages = {
  "Vandal": "img/spray/vandal.png",
  "Phantom": "img/spray/phantom.png",
  "Spectre": "img/spray/spectre.png",
  "Stinger": "img/spray/stinger.png",
  "Ares": "img/spray/ares.png",
  "Odin": "img/spray/odin.png",
  "Guardian": "img/spray/guardian.png",
  "Bulldog": "img/spray/bulldog.png",
  "Classic": "img/spray/classic.png",
  "Frenzy": "img/spray/frenzy.png",
  "Ghost": "img/spray/ghost.png",
  "Sheriff": "img/spray/sheriff.png"
};

document.addEventListener('DOMContentLoaded', async function () {
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
  ].filter(function (el) {
    return Boolean(el);
  });

  if (globalSearch && allLists.length > 0) {
    globalSearch.addEventListener('input', function () {
      const term = globalSearch.value.toLowerCase();

      allLists.forEach(function (list) {
        const children = Array.from(list.children);
        children.forEach(function (li) {
          const text = li.textContent.toLowerCase();
          li.style.display = text.indexOf(term) !== -1 ? '' : 'none';
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
        arr = arr.filter(function (a) {
          return a.role && a.role.displayName === roleFilter;
        });
      }

      if (sortBy === 'name') {
        arr.sort(function (a, b) {
          return a.displayName.localeCompare(b.displayName);
        });
      } else if (sortBy === 'role') {
        arr.sort(function (a, b) {
          const rA = a.role ? a.role.displayName : '';
          const rB = b.role ? b.role.displayName : '';
          const byRole = rA.localeCompare(rB);
          if (byRole !== 0) {
            return byRole;
          }
          return a.displayName.localeCompare(b.displayName);
        });
      }

      listAgents.innerHTML = '';

      arr.forEach(function (agent) {
        const li = document.createElement('li');
        li.style.cursor = 'pointer';

        const name = agent.displayName || 'Unbekannt';
        const img = agent.displayIcon || '';

        li.innerHTML = ''
          + '<strong>' + name + '</strong><br>'
          + (img ? '<img src="' + img + '" alt="' + name + '" width="150"><br>' : '');

        li.addEventListener('click', function () {
          const existing = li.querySelector('.agent-extra');
          if (existing) {
            existing.remove();
            return;
          }

          const portrait = agent.fullPortrait || agent.displayIcon || '';
          const desc = agent.description || 'Keine Beschreibung vorhanden.';
          const roleName = agent.role && agent.role.displayName ? agent.role.displayName : 'Keine Rolle';
          const abilities = (agent.abilities || [])
            .filter(function (a) {
              return a.displayName;
            })
            .map(function (a) {
              return a.displayName;
            })
            .join(', ');

          const extra = document.createElement('div');
          extra.className = 'agent-extra';
          extra.innerHTML = ''
            + '<hr>'
            + (portrait ? '<img src="' + portrait + '" alt="' + name + '" width="250"><br>' : '')
            + '<p>' + desc + '</p>'
            + '<p><strong>Rolle:</strong> ' + roleName + '</p>'
            + '<p><strong>Fähigkeiten:</strong> ' + abilities + '</p>';

          li.appendChild(extra);
        });

        listAgents.appendChild(li);
      });
    }

    if (agentSort) {
      agentSort.addEventListener('change', function () {
        renderAgents();
      });
    }
    if (agentRoleFilter) {
      agentRoleFilter.addEventListener('change', function () {
        renderAgents();
      });
    }

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
        arr.sort(function (a, b) {
          return a.displayName.localeCompare(b.displayName);
        });
      } else if (sortBy === 'price') {
        arr.sort(function (a, b) {
          const costA = a.shopData && typeof a.shopData.cost === 'number' ? a.shopData.cost : Infinity;
          const costB = b.shopData && typeof b.shopData.cost === 'number' ? b.shopData.cost : Infinity;
          if (costA === costB) {
            return a.displayName.localeCompare(b.displayName);
          }
          return costA - costB;
        });
      }

      listWeapons.innerHTML = '';

      arr.forEach(function (weapon) {
        const li = document.createElement('li');
        li.style.cursor = 'pointer';

        const name = weapon.displayName || 'Unbekannt';
        const img = weapon.displayIcon || '';

        li.innerHTML = ''
          + '<strong>' + name + '</strong><br>'
          + (img ? '<img src="' + img + '" alt="' + name + '" width="150"><br>' : '');

        li.addEventListener('click', function () {
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

          const spraySrc = weaponSprayImages[weapon.displayName];
          let sprayHtml = '';

          if (spraySrc) {
            sprayHtml = ''
              + '<h3>Spray Pattern</h3>'
              + '<img src="' + spraySrc + '" alt="Spray Pattern" width="250"><br>';
          }

          const extra = document.createElement('div');
          extra.className = 'weapon-extra';
          extra.innerHTML = ''
            + '<hr>'
            + '<p><strong>Kategorie:</strong> ' + category + '</p>'
            + (cost !== null ? '<p><strong>Preis:</strong> ' + cost + ' Credits</p>' : '')
            + (stats.fireRate ? '<p><strong>Fire Rate:</strong> ' + stats.fireRate + '</p>' : '')
            + (stats.magazineSize ? '<p><strong>Magazin:</strong> ' + stats.magazineSize + ' Schuss</p>' : '')
            + (stats.reloadTimeSeconds ? '<p><strong>Reload:</strong> ' + stats.reloadTimeSeconds + 's</p>' : '')
            + sprayHtml;

          const skins = weapon.skins || [];

          if (skins.length > 0) {
            const skinsTitle = document.createElement('h3');
            skinsTitle.textContent = 'Skins';
            extra.appendChild(skinsTitle);

            const skinsWrapper = document.createElement('div');
            skinsWrapper.className = 'weapon-skins';

            skins.forEach(function (skin) {
              if (!skin.displayName || skin.displayName === 'Random Favorite Skin') {
                return;
              }

              const skinDiv = document.createElement('div');
              skinDiv.className = 'weapon-skin';

              const skinName = document.createElement('p');
              skinName.textContent = skin.displayName;
              skinDiv.appendChild(skinName);

              let imgUrl = null;

              if (skin.displayIcon) {
                imgUrl = skin.displayIcon;
              } else if (skin.chromas && skin.chromas.length > 0 && skin.chromas[0].fullRender) {
                imgUrl = skin.chromas[0].fullRender;
              }

              if (imgUrl) {
                const skinImg = document.createElement('img');
                skinImg.src = imgUrl;
                skinImg.alt = skin.displayName;
                skinDiv.appendChild(skinImg);
              }

              if (skin.levels && skin.levels.length > 0) {
                let videoUrl = null;
                for (let i = 0; i < skin.levels.length; i++) {
                  if (skin.levels[i].streamedVideo) {
                    videoUrl = skin.levels[i].streamedVideo;
                    break;
                  }
                }
                if (videoUrl) {
                  const br = document.createElement('br');
                  skinDiv.appendChild(br);
                  const videoLink = document.createElement('a');
                  videoLink.href = videoUrl;
                  videoLink.target = '_blank';
                  videoLink.textContent = 'Preview-Video';
                  skinDiv.appendChild(videoLink);
                }
              }

              skinsWrapper.appendChild(skinDiv);
            });

            extra.appendChild(skinsWrapper);
          }

          li.appendChild(extra);
        });

        listWeapons.appendChild(li);
      });
    }

    if (weaponSort) {
      weaponSort.addEventListener('change', function () {
        renderWeapons();
      });
    }

    renderWeapons();
  }

  if (listMaps) {
    const res = await fetch('https://valorant-api.com/v1/maps');
    const data = await res.json();

    (data.data || []).forEach(function (map) {
      const li = document.createElement('li');
      li.style.cursor = 'pointer';

      const name = map.displayName || 'Unbekannte Map';
      const splash = map.splash || '';
      const minimap = map.displayIcon || map.listViewIcon || '';
      const coords = map.coordinates || '';

      li.innerHTML = ''
        + '<strong>' + name + '</strong><br>'
        + (splash ? '<img src="' + splash + '" width="250"><br>' : '');

      li.addEventListener('click', function () {
        const existing = li.querySelector('.map-extra');
        if (existing) {
          existing.remove();
          return;
        }

        const extra = document.createElement('div');
        extra.className = 'map-extra';
        extra.innerHTML = ''
          + '<hr>'
          + (minimap ? '<img src="' + minimap + '" alt="' + name + ' Minimap" width="250"><br>' : '')
          + (coords ? '<p><strong>Koordinaten:</strong> ' + coords + '</p>' : '');

        li.appendChild(extra);
      });

      listMaps.appendChild(li);
    });
  }

  if (listBundles) {
    const res = await fetch('https://valorant-api.com/v1/bundles');
    const data = await res.json();

    (data.data || []).forEach(function (bundle) {
      const li = document.createElement('li');
      li.innerHTML = ''
        + '<strong>' + bundle.displayName + '</strong><br>'
        + (bundle.displayIcon ? '<img src="' + bundle.displayIcon + '" width="200"><br>' : '');
      listBundles.appendChild(li);
    });
  }

  if (listGamemodes) {
    const res = await fetch('https://valorant-api.com/v1/gamemodes');
    const data = await res.json();

    (data.data || []).forEach(function (mode) {
      const li = document.createElement('li');
      const name = mode.displayName || 'Unbekannter Modus';
      const icon = mode.displayIcon || '';
      li.innerHTML = ''
        + '<strong>' + name + '</strong><br>'
        + (icon ? '<img src="' + icon + '" width="150"><br>' : '');
      listGamemodes.appendChild(li);
    });
  }

  if (listCompTiers) {
    const res = await fetch('https://valorant-api.com/v1/competitivetiers');
    const json = await res.json();

    const sets = json.data || [];
    const latest = sets[sets.length - 1];
    const tiers = latest.tiers.filter(function (t) {
      return t.tier > 0;
    });

    tiers.forEach(function (t) {
      const li = document.createElement('li');
      li.innerHTML = ''
        + '<strong>' + t.tierName + '</strong><br>'
        + (t.largeIcon ? '<img src="' + t.largeIcon + '" width="150"><br>' : '')
        + '<small>Tier ' + t.tier + '</small>';
      listCompTiers.appendChild(li);
    });
  }

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }
});
