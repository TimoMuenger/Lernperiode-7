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

document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('themeToggle');
  if (!btn) {
    return;
  }

  btn.addEventListener('click', function () {
    document.body.classList.toggle('light');

    if (document.body.classList.contains('light')) {
      btn.textContent = "Dark Mode";
    } else {
      btn.textContent = "Light Mode";
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var selectA = document.getElementById('weaponA');
  var selectB = document.getElementById('weaponB');
  var result = document.getElementById('resultWeapons');
  var compareBtn = document.getElementById('compareWeaponsBtn');
  var weapons = [];

  if (!selectA || !selectB || !result || !compareBtn) {
    return;
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) {
      return "";
    }
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  fetch('https://valorant-api.com/v1/weapons')
    .then(function (res) { return res.json(); })
    .then(function (json) {
      weapons = json.data || [];

      weapons.forEach(function (w) {
        var opt1 = document.createElement('option');
        opt1.value = w.uuid;
        opt1.textContent = w.displayName;

        var opt2 = opt1.cloneNode(true);

        selectA.appendChild(opt1);
        selectB.appendChild(opt2);
      });
    });

  compareBtn.addEventListener('click', function () {
    var weaponA = weapons.find(function (w) { return w.uuid === selectA.value; });
    var weaponB = weapons.find(function (w) { return w.uuid === selectB.value; });

    if (!weaponA || !weaponB) {
      result.textContent = "Bitte zwei Waffen auswählen.";
      return;
    }

    var sprayA = weaponSprayImages[weaponA.displayName];
    var sprayB = weaponSprayImages[weaponB.displayName];

    var nameA = escapeHtml(weaponA.displayName);
    var nameB = escapeHtml(weaponB.displayName);

    var costA = weaponA.shopData ? weaponA.shopData.cost : "?";
    var costB = weaponB.shopData ? weaponB.shopData.cost : "?";

    var fireA = weaponA.weaponStats ? weaponA.weaponStats.fireRate : "?";
    var fireB = weaponB.weaponStats ? weaponB.weaponStats.fireRate : "?";

    var magA = weaponA.weaponStats ? weaponA.weaponStats.magazineSize : "?";
    var magB = weaponB.weaponStats ? weaponB.weaponStats.magazineSize : "?";

    result.innerHTML =
      "<h2>" + nameA + " vs " + nameB + "</h2>" +
      "<p>Preis: " + costA + " --> " + costB + "</p>" +
      "<p>Fire Rate: " + fireA + " --> " + fireB + "</p>" +
      "<p>Magazine Size: " + magA + " --> " + magB + "</p>" +
      "<p>Spray Pattern:</p>" +
      "<div style='display: flex; gap: 20px; align-items: center;'>" +
        "<div>" +
          "<p>" + nameA + "</p>" +
          (sprayA ? "<img src='" + escapeHtml(sprayA) + "' alt='Spray " + nameA + "' style='width: 200px;'>" : "<p>Kein Spray Bild</p>") +
        "</div>" +
        "<div>" +
          "<p>" + nameB + "</p>" +
          (sprayB ? "<img src='" + escapeHtml(sprayB) + "' alt='Spray " + nameB + "' style='width: 200px;'>" : "<p>Kein Spray Bild</p>") +
        "</div>" +
      "</div>";
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) {
    return;
  }

  var iconImg = document.getElementById('ability-icon');
  var answerButtons = document.querySelectorAll('.answer-btn');
  var feedback = document.getElementById('quiz-feedback');
  var scoreText = document.getElementById('quiz-score');
  var nextBtn = document.getElementById('next-question-btn');

  var agents = [];
  var abilities = [];
  var currentCorrectAgent = null;
  var score = 0;
  var total = 0;

  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  function buildAbilityPool() {
    abilities = [];
    for (var i = 0; i < agents.length; i++) {
      var agent = agents[i];
      if (!agent.abilities || !agent.displayName) {
        continue;
      }
      for (var j = 0; j < agent.abilities.length; j++) {
        var ability = agent.abilities[j];
        if (ability && ability.displayIcon && ability.displayName) {
          abilities.push({
            agentName: agent.displayName,
            icon: ability.displayIcon,
            abilityName: ability.displayName
          });
        }
      }
    }
  }

  function pickQuestion() {
    feedback.textContent = "";
    if (abilities.length === 0) {
      return;
    }

    var randomIndex = Math.floor(Math.random() * abilities.length);
    var chosen = abilities[randomIndex];

    currentCorrectAgent = chosen.agentName;
    iconImg.src = chosen.icon;
    iconImg.alt = chosen.abilityName;

    var options = [chosen.agentName];

    while (options.length < 4 && options.length < agents.length) {
      var randomAgent = agents[Math.floor(Math.random() * agents.length)];
      if (options.indexOf(randomAgent.displayName) === -1) {
        options.push(randomAgent.displayName);
      }
    }

    shuffle(options);

    for (var i = 0; i < answerButtons.length; i++) {
      if (i < options.length) {
        answerButtons[i].style.display = "inline-block";
        answerButtons[i].textContent = options[i];
        answerButtons[i].disabled = false;
      } else {
        answerButtons[i].style.display = "none";
      }
    }

    updateScoreText();
  }

  function handleAnswerClick(event) {
    var chosenName = event.target.textContent;
    total += 1;
    if (chosenName === currentCorrectAgent) {
      score += 1;
      feedback.textContent = "Richtig! " + currentCorrectAgent + ".";
    } else {
      feedback.textContent = "Falsch. Richtige Antwort: " + currentCorrectAgent + ".";
    }
    for (var i = 0; i < answerButtons.length; i++) {
      answerButtons[i].disabled = true;
    }
    updateScoreText();
  }

  function updateScoreText() {
    if (total === 0) {
      scoreText.textContent = "";
    } else {
      scoreText.textContent = "Punkte: " + score + " / " + total;
    }
  }

  for (var i = 0; i < answerButtons.length; i++) {
    answerButtons[i].addEventListener('click', handleAnswerClick);
  }

  nextBtn.addEventListener('click', function () {
    pickQuestion();
  });

  fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
    .then(function (res) {
      return res.json();
    })
    .then(function (json) {
      agents = json.data || [];
      buildAbilityPool();
      pickQuestion();
    })
    .catch(function (err) {
      feedback.textContent = "Fehler beim Laden der Daten.";
      console.log(err);
    });
});

document.addEventListener('DOMContentLoaded', function () {
  var agentSelectA = document.getElementById('agentA');
  var agentSelectB = document.getElementById('agentB');
  var agentResult = document.getElementById('resultAgents');
  var compareAgentsBtn = document.getElementById('compareAgentsBtn');
  var agents = [];

  if (!agentSelectA || !agentSelectB || !agentResult || !compareAgentsBtn) {
    return;
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) {
      return "";
    }
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  fetch('https://valorant-api.com/v1/agents?isPlayableCharacter=true')
    .then(function (res) { return res.json(); })
    .then(function (json) {
      agents = json.data || [];

      agents.forEach(function (a) {
        var opt1 = document.createElement('option');
        opt1.value = a.uuid;
        opt1.textContent = a.displayName;

        var opt2 = opt1.cloneNode(true);

        agentSelectA.appendChild(opt1);
        agentSelectB.appendChild(opt2);
      });
    });

  compareAgentsBtn.addEventListener('click', function () {
    var a = agents.find(function (x) { return x.uuid === agentSelectA.value; });
    var b = agents.find(function (x) { return x.uuid === agentSelectB.value; });

    if (!a || !b) {
      agentResult.textContent = "Bitte zwei Agents auswählen.";
      return;
    }

    var nameA = escapeHtml(a.displayName || "—");
    var nameB = escapeHtml(b.displayName || "—");

    var roleA = a.role && a.role.displayName ? escapeHtml(a.role.displayName) : "—";
    var roleB = b.role && b.role.displayName ? escapeHtml(b.role.displayName) : "—";

    var imgA = a.fullPortrait || a.displayIcon || "";
    var imgB = b.fullPortrait || b.displayIcon || "";

    var abilA = (a.abilities || []).filter(function (z) { return z && z.displayName; }).map(function (z) { return z.displayName; }).join(", ");
    var abilB = (b.abilities || []).filter(function (z) { return z && z.displayName; }).map(function (z) { return z.displayName; }).join(", ");

    agentResult.innerHTML =
      "<h2>" + nameA + " vs " + nameB + "</h2>" +
      "<div style='display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap;'>" +
        "<div style='min-width:260px;'>" +
          (imgA ? "<img src='" + escapeHtml(imgA) + "' alt='" + nameA + "' style='width:260px; max-width:100%;'><br>" : "") +
          "<p><strong>Role:</strong> " + roleA + "</p>" +
          "<p><strong>Fähigkeiten:</strong> " + escapeHtml(abilA || "—") + "</p>" +
        "</div>" +
        "<div style='min-width:260px;'>" +
          (imgB ? "<img src='" + escapeHtml(imgB) + "' alt='" + nameB + "' style='width:260px; max-width:100%;'><br>" : "") +
          "<p><strong>Role:</strong> " + roleB + "</p>" +
          "<p><strong>Fähigkeiten:</strong> " + escapeHtml(abilB || "—") + "</p>" +
        "</div>" +
      "</div>";
  });
});

document.addEventListener("DOMContentLoaded", function () {
  let btnAgent = document.getElementById("btn-random-agent");
  let btnWeapon = document.getElementById("btn-random-weapon");
  let btnMap = document.getElementById("btn-random-map");

  let outAgent = document.getElementById("random-agent");
  let outWeapon = document.getElementById("random-weapon");
  let outMap = document.getElementById("random-map");

  if (!btnAgent || !btnWeapon || !btnMap || !outAgent || !outWeapon || !outMap) {
    return;
  }

  function getRandomItem(list) {
    if (!Array.isArray(list) || list.length === 0) {
      return null;
    }
    let idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }

  function setLoading(el) {
    el.innerHTML = "<p class='muted'>Lade...</p>";
  }

  function setError(el) {
    el.innerHTML = "<p class='muted'>Konnte nicht laden (API/Netzwerk).</p>";
  }

  function escapeHtml(text) {
    if (text === null || text === undefined) {
      return "";
    }
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderAgent(agent) {
    let name = agent && agent.displayName ? agent.displayName : "Unbekannt";
    let role = agent && agent.role && agent.role.displayName ? agent.role.displayName : "—";
    let img = agent && agent.displayIcon ? agent.displayIcon : "";

    outAgent.innerHTML =
      "<div class='result-row'>" +
        (img ? "<img class='result-img' src='" + escapeHtml(img) + "' alt='" + escapeHtml(name) + "'>" : "") +
        "<div class='result-text'>" +
          "<h3>" + escapeHtml(name) + "</h3>" +
          "<p class='muted'>Role: " + escapeHtml(role) + "</p>" +
        "</div>" +
      "</div>";
  }

  function renderWeapon(weapon) {
    let name = weapon && weapon.displayName ? weapon.displayName : "Unbekannt";
    let img = weapon && weapon.displayIcon ? weapon.displayIcon : "";

    let categoryRaw = weapon && weapon.category ? weapon.category : "";
    let category = categoryRaw ? categoryRaw.replace("EEquippableCategory::", "") : "—";

    outWeapon.innerHTML =
      "<div class='result-row'>" +
        (img ? "<img class='result-img' src='" + escapeHtml(img) + "' alt='" + escapeHtml(name) + "'>" : "") +
        "<div class='result-text'>" +
          "<h3>" + escapeHtml(name) + "</h3>" +
          "<p class='muted'>Kategorie: " + escapeHtml(category) + "</p>" +
        "</div>" +
      "</div>";
  }

  function renderMap(map) {
    let name = map && map.displayName ? map.displayName : "Unbekannt";
    let img = map && map.splash ? map.splash : (map && map.displayIcon ? map.displayIcon : "");

    outMap.innerHTML =
      "<div class='result-row'>" +
        (img ? "<img class='result-img wide' src='" + escapeHtml(img) + "' alt='" + escapeHtml(name) + "'>" : "") +
        "<div class='result-text'>" +
          "<h3>" + escapeHtml(name) + "</h3>" +
        "</div>" +
      "</div>";
  }

  function fetchJson(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      return res.json();
    });
  }

  function loadRandomAgent() {
    setLoading(outAgent);

    let url = "https://valorant-api.com/v1/agents?isPlayableCharacter=true";
    fetchJson(url)
      .then(function (data) {
        let list = data && data.data ? data.data : [];
        let agent = getRandomItem(list);
        if (!agent) {
          setError(outAgent);
          return;
        }
        renderAgent(agent);
      })
      .catch(function () {
        setError(outAgent);
      });
  }

  function loadRandomWeapon() {
    setLoading(outWeapon);

    let url = "https://valorant-api.com/v1/weapons";
    fetchJson(url)
      .then(function (data) {
        let list = data && data.data ? data.data : [];
        let weapon = getRandomItem(list);
        if (!weapon) {
          setError(outWeapon);
          return;
        }
        renderWeapon(weapon);
      })
      .catch(function () {
        setError(outWeapon);
      });
  }

  function loadRandomMap() {
    setLoading(outMap);

    let url = "https://valorant-api.com/v1/maps";
    fetchJson(url)
      .then(function (data) {
        let list = data && data.data ? data.data : [];
        let map = getRandomItem(list);
        if (!map) {
          setError(outMap);
          return;
        }
        renderMap(map);
      })
      .catch(function () {
        setError(outMap);
      });
  }

  btnAgent.addEventListener("click", function () {
    loadRandomAgent();
  });

  btnWeapon.addEventListener("click", function () {
    loadRandomWeapon();
  });

  btnMap.addEventListener("click", function () {
    loadRandomMap();
  });
});
