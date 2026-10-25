const races = {
  // ----- Core races (SRD) -----
  Dragonborn: { bonuses: { Strength: 2, Charisma: 1 } },
  Dwarf: { bonuses: { Constitution: 2 } },
  Elf: { bonuses: { Dexterity: 2 } },
  Gnome: { bonuses: { Intelligence: 2 } },
  "Half-Elf": { bonuses: { Charisma: 2 } },
  "Half-Orc": { bonuses: { Strength: 2, Constitution: 1 } },
  Halfling: { bonuses: { Dexterity: 2 } },
  Human: {
    bonuses: {
      Strength: 1,
      Dexterity: 1,
      Constitution: 1,
      Intelligence: 1,
      Wisdom: 1,
      Charisma: 1,
    },
  },
  Tiefling: { bonuses: { Charisma: 2, Intelligence: 1 } },

  // ----- Other races (same list as the dropdown in index.html; no bonuses yet) -----
  Aasimar: { bonuses: {} },
  Aarakocra: { bonuses: {} },
  Autognome: { bonuses: {} },
  Bugbear: { bonuses: {} },
  Centaur: { bonuses: {} },
  Changeling: { bonuses: {} },
  "Deep Gnome": { bonuses: {} },
  Dhampir: { bonuses: {} },
  Fairy: { bonuses: {} },
  Firbolg: { bonuses: {} },
  Genasi: { bonuses: {} },
  Giff: { bonuses: {} },
  Githyanki: { bonuses: {} },
  Githzerai: { bonuses: {} },
  Goblin: { bonuses: {} },
  Goliath: { bonuses: {} },
  Grung: { bonuses: {} },
  Hadozee: { bonuses: {} },
  Harengon: { bonuses: {} },
  Hobgoblin: { bonuses: {} },
  Kenku: { bonuses: {} },
  Kender: { bonuses: {} },
  Kobold: { bonuses: {} },
  Leonin: { bonuses: {} },
  Lizardfolk: { bonuses: {} },
  Loxodon: { bonuses: {} },
  Minotaur: { bonuses: {} },
  Orc: { bonuses: {} },
  Owlin: { bonuses: {} },
  Plasmoid: { bonuses: {} },
  Satyr: { bonuses: {} },
  "Shadar-kai": { bonuses: {} },
  Shifter: { bonuses: {} },
  Tabaxi: { bonuses: {} },
  "Thri-kreen": { bonuses: {} },
  Tortle: { bonuses: {} },
  Triton: { bonuses: {} },
  Vedalken: { bonuses: {} },
  Warforged: { bonuses: {} },
  "Yuan-ti": { bonuses: {} },
};
function createDice3D() {
  const container = document.getElementById("dice3d");
  const size = 170;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // The d20 shape: an icosahedron
  const geometry = new THREE.IcosahedronGeometry(1.2, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x5b3fa6,
    flatShading: true,
    roughness: 0.35,
    metalness: 0.25,
  });
  const mesh = new THREE.Mesh(geometry, material);

  // Gold edges on every facet
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xe0b84f })
  );
  mesh.add(edges);

  // ----- Numbers on the 20 faces -----
  const pos = geometry.attributes.position;
  const faces = [];

  for (let i = 0; i < pos.count; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(pos, i);
    const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
    const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
    const center = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
    faces.push({ center, normal: center.clone().normalize(), number: 0 });
  }

  // Opposite faces add up to 21, like a real d20
  let next = 1;
  faces.forEach((face, i) => {
    if (face.number) return;
    face.number = next;
    const opposite = faces.find(
      (f, j) => j !== i && !f.number && f.normal.dot(face.normal) < -0.99
    );
    if (opposite) opposite.number = 21 - next;
    next++;
  });

  function makeNumberTexture(n) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#e0b84f";
    ctx.font = "bold 150px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(n), 128, 128);
    if (n === 6 || n === 9) ctx.fillRect(80, 210, 96, 12); // underline 6 and 9
    return new THREE.CanvasTexture(canvas);
  }

  faces.forEach((face) => {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.6, 0.6),
      new THREE.MeshBasicMaterial({
        map: makeNumberTexture(face.number),
        transparent: true,
      })
    );
    plane.position.copy(face.center).addScaledVector(face.normal, 0.03);
    plane.lookAt(face.center.clone().multiplyScalar(2));
    mesh.add(plane);
  });

  console.log("d20 faces numbered:", faces.length);

  scene.add(mesh);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.DirectionalLight(0xffffff, 0.9);
  light.position.set(3, 4, 5);
  scene.add(light);

  const idleSpeed = 0.006;
  let spinSpeed = idleSpeed;

  function animate() {
    requestAnimationFrame(animate);
    mesh.rotation.x += spinSpeed;
    mesh.rotation.y += spinSpeed * 1.3;
    spinSpeed += (idleSpeed - spinSpeed) * 0.04;
    renderer.render(scene, camera);
  }
  animate();

  return {
    spin() {
      spinSpeed = 0.35;
    },
  };
}

const dice3d = createDice3D();

document.getElementById("dice3d").addEventListener("click", () => {
  document.getElementById("roll-btn").click();
});
// ----- Profile card -----
const details = {};

function esc(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
const hitDice = {
  barbarian: 12,
  fighter: 10,
  paladin: 10,
  ranger: 10,
  "blood-hunter": 10,
  artificer: 8,
  bard: 8,
  cleric: 8,
  druid: 8,
  monk: 8,
  rogue: 8,
  warlock: 8,
  sorcerer: 6,
  wizard: 6,
};

function getHP() {
  const finalScores = getFinalScores();
  const die = hitDice[character.class];
  if (!finalScores || !die) return null;
  return { die, hp: Math.max(1, die + getModifier(finalScores.Constitution)) };
}
// Suggested starting kit per class, plus what's needed to work out Armor Class
// acBase: armor's base AC | dexCap: 0 = ignores Dexterity (heavy), 2 = max +2 (medium), null = full Dexterity
// extraAbility: for Unarmored Defense (Barbarian, Monk)
const startingGear = {
  artificer: {
    items: [
      "Studded leather armor",
      "Light crossbow and 20 bolts",
      "Two simple weapons",
      "Thieves' tools",
      "Dungeoneer's pack",
    ],
    acBase: 12,
    dexCap: null,
    shield: false,
  },
  barbarian: {
    items: ["Greataxe", "Two handaxes", "Four javelins", "Explorer's pack"],
    acBase: 10,
    dexCap: null,
    shield: false,
    extraAbility: "Constitution",
  },
  bard: {
    items: ["Rapier", "Dagger", "Leather armor", "Lute", "Diplomat's pack"],
    acBase: 11,
    dexCap: null,
    shield: false,
  },
  "blood-hunter": {
    items: [
      "Leather armor",
      "A martial weapon",
      "Two handaxes",
      "Explorer's pack",
    ],
    acBase: 11,
    dexCap: null,
    shield: false,
  },
  cleric: {
    items: [
      "Mace",
      "Scale mail",
      "Shield",
      "Holy symbol",
      "Light crossbow and 20 bolts",
      "Priest's pack",
    ],
    acBase: 14,
    dexCap: 2,
    shield: true,
  },
  druid: {
    items: [
      "Wooden shield",
      "Scimitar",
      "Leather armor",
      "Druidic focus",
      "Explorer's pack",
    ],
    acBase: 11,
    dexCap: null,
    shield: true,
  },
  fighter: {
    items: [
      "Chain mail",
      "Longsword",
      "Shield",
      "Light crossbow and 20 bolts",
      "Dungeoneer's pack",
    ],
    acBase: 16,
    dexCap: 0,
    shield: true,
  },
  monk: {
    items: ["Shortsword", "10 darts", "Dungeoneer's pack"],
    acBase: 10,
    dexCap: null,
    shield: false,
    extraAbility: "Wisdom",
  },
  paladin: {
    items: [
      "Chain mail",
      "Longsword",
      "Shield",
      "Five javelins",
      "Holy symbol",
      "Priest's pack",
    ],
    acBase: 16,
    dexCap: 0,
    shield: true,
  },
  ranger: {
    items: [
      "Leather armor",
      "Two shortswords",
      "Longbow and 20 arrows",
      "Dungeoneer's pack",
    ],
    acBase: 11,
    dexCap: null,
    shield: false,
  },
  rogue: {
    items: [
      "Rapier",
      "Shortbow and 20 arrows",
      "Leather armor",
      "Two daggers",
      "Thieves' tools",
      "Burglar's pack",
    ],
    acBase: 11,
    dexCap: null,
    shield: false,
  },
  sorcerer: {
    items: [
      "Light crossbow and 20 bolts",
      "Arcane focus",
      "Two daggers",
      "Dungeoneer's pack",
    ],
    acBase: 10,
    dexCap: null,
    shield: false,
  },
  warlock: {
    items: [
      "Light crossbow and 20 bolts",
      "Arcane focus",
      "Leather armor",
      "A simple weapon",
      "Two daggers",
      "Scholar's pack",
    ],
    acBase: 11,
    dexCap: null,
    shield: false,
  },
  wizard: {
    items: ["Quarterstaff", "Arcane focus", "Spellbook", "Scholar's pack"],
    acBase: 10,
    dexCap: null,
    shield: false,
  },
};

function getAC() {
  const finalScores = getFinalScores();
  const gear = startingGear[character.class];
  if (!finalScores || !gear) return null;

  let dex = getModifier(finalScores.Dexterity);
  if (gear.dexCap === 0) dex = 0;
  else if (gear.dexCap) dex = Math.min(dex, gear.dexCap);

  let ac = gear.acBase + dex;
  if (gear.extraAbility) ac += getModifier(finalScores[gear.extraAbility]);
  if (gear.shield) ac += 2;
  return ac;
}

function renderCard() {
  const card = document.getElementById("card");
  const name = esc(character.name.trim() || "Unnamed hero");
  const parts = [character.raceLabel, character.classLabel].filter(Boolean);
  const subtitle = parts.length
    ? esc(parts.join(" · "))
    : "Choose a race and a class";

  const facts = [
    ["Background", details.background],
    ["Alignment", details.alignment],
    ["Age", details.age],
    ["Height", details.height],
    ["Hair", details.hair],
    ["Eyes", details.eyes],
  ].filter(([, value]) => value);

  const factsHTML = facts
    .map(
      ([label, value]) => `<li><strong>${label}:</strong> ${esc(value)}</li>`
    )
    .join("");

  const finalScores = getFinalScores();
  const statsHTML = finalScores
    ? `<div class="chips">${abilities
        .map(
          (a) =>
            `<span class="chip">${a.slice(0, 3).toUpperCase()} ${
              finalScores[a]
            } (${formatMod(getModifier(finalScores[a]))})</span>`
        )
        .join("")}</div>`
    : "";
  const hpInfo = getHP();
  const hpHTML = hpInfo
    ? `<p class="card-hp"><strong>Hit Points:</strong> ${hpInfo.hp} <span>(level 1, d${hpInfo.die} hit die)</span></p>`
    : "";
  const gear = startingGear[character.class];
  const ac = getAC();
  const gearHTML = gear
    ? `${
        ac !== null
          ? `<p class="card-hp"><strong>Armor Class:</strong> ${ac}</p>`
          : ""
      }
         <p><strong>Starting gear:</strong> ${esc(gear.items.join(", "))}</p>`
    : "";

  card.innerHTML = `
    <article class="profile-card">
      <h3 class="card-name">${name}</h3>
      <p class="card-sub">${subtitle}</p>
      ${factsHTML ? `<ul class="card-facts">${factsHTML}</ul>` : ""}
      ${statsHTML}
      ${hpHTML}
      ${gearHTML}
      ${
        details.trait
          ? `<p><strong>Personality:</strong> ${esc(details.trait)}</p>`
          : ""
      }
      ${
        details.goal ? `<p><strong>Goal:</strong> ${esc(details.goal)}</p>` : ""
      }
      ${
        details.backstory
          ? `<p class="card-story">${esc(details.backstory)}</p>`
          : ""
      }
    </article>
  `;
}

// Every field with class "detail" saves its value under its data-key
document.querySelectorAll(".detail").forEach((el) => {
  const update = () => {
    details[el.dataset.key] = el.value.trim();
    render();
  };
  el.addEventListener("input", update);
  el.addEventListener("change", update);
});

const rollSound = new Audio("diceRoll.mp3");
rollSound.volume = 0.5;

let soundOn = true;

function playRollSound() {
  if (!soundOn) return;
  rollSound.currentTime = 0; // restarts the sound on quick repeated clicks
  rollSound.play().catch(() => {}); // ignores errors if the browser blocks it
}

function spinDice() {
  playRollSound();
  dice3d.spin();
}
const soundToggle = document.getElementById("sound-toggle");

soundToggle.addEventListener("click", () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? "mute" : "🚫";
});
// ----- Randomize -----
const randomData = {
  firstNames: [
    "Thorin",
    "Elara",
    "Kael",
    "Mira",
    "Doran",
    "Sylas",
    "Brea",
    "Garrick",
    "Lyra",
    "Fenn",
    "Orin",
    "Tess",
    "Varek",
    "Nyra",
    "Bram",
  ],
  lastNames: [
    "Stormwind",
    "Ironfoot",
    "Nightbloom",
    "Ashford",
    "Brightblade",
    "Duskwhisper",
    "Stonehelm",
    "Fairwind",
    "Emberlight",
    "Hollowtree",
  ],
  hair: [
    "Silver",
    "Black",
    "Auburn",
    "Golden",
    "White",
    "Copper",
    "Midnight blue",
    "Dark and braided",
  ],
  eyes: ["Amber", "Green", "Grey", "Violet", "Brown", "Ice blue", "Gold"],
  traits: [
    "Curious, never backs down from a dare",
    "Quiet and watchful, trusts slowly",
    "Loud, generous, and always hungry",
    "Dry humor and a stubborn streak",
    "Gentle with animals, fierce with bullies",
  ],
  goals: [
    "Find the lost library of Aldoria",
    "Earn enough gold to buy back the family farm",
    "Become a legend sung in every tavern",
    "Uncover who sent the mysterious letter",
    "Protect a village that never asked for help",
  ],
  origins: [
    "grew up in a quiet river village",
    "was raised by traveling merchants",
    "spent childhood in a crumbling mountain monastery",
    "learned to survive on the crowded city docks",
  ],
  events: [
    "One night, a mysterious letter changed everything",
    "Then a stranger arrived with an ancient map",
    "A promise to a dying friend set the road ahead",
    "Now the call of adventure is too loud to ignore",
  ],
};

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Chooses a random real option in a <select> (skips the placeholder)
function pickRandomOption(select) {
  const options = Array.from(select.options).filter(
    (o) => o.value && !o.disabled
  );
  const chosen = pick(options);
  select.value = chosen.value;
  return chosen;
}

function randomizeCharacter() {
  // Name
  const name = `${pick(randomData.firstNames)} ${pick(randomData.lastNames)}`;
  nameInput.value = name;
  character.name = name;

  // Race and class
  const race = pickRandomOption(raceSelect);
  character.race = race.value;
  character.raceLabel = race.text;

  const cls = pickRandomOption(classSelect);
  character.class = cls.value;
  character.classLabel = cls.text;

  // Look & Story fields
  const random = {
    age: String(randomInt(18, 120)),
    height: `${(1.4 + Math.random() * 0.7).toFixed(2)} m`,
    hair: pick(randomData.hair),
    eyes: pick(randomData.eyes),
    trait: pick(randomData.traits),
    goal: pick(randomData.goals),
    backstory: `${name} ${pick(randomData.origins)}. ${pick(
      randomData.events
    )}.`,
  };

  document.querySelectorAll(".detail").forEach((el) => {
    const key = el.dataset.key;
    if (el.tagName === "SELECT") {
      pickRandomOption(el);
    } else {
      el.value = random[key] || "";
    }
    details[key] = el.value;
  });

  // Rolling the scores also spins the die, plays the sound, and redraws the card
  spinDice();
  rollScores();
}

document.getElementById("random-btn").addEventListener("click", () => {
  if (
    (character.baseScores || character.name) &&
    !confirm("Randomize a new hero? Your current hero will be replaced.")
  )
    return;
  randomizeCharacter();
});
// ----- Core logic: character data and ability scores -----
const abilities = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

const character = {
  name: "",
  race: "",
  raceLabel: "",
  class: "",
  classLabel: "",
  baseScores: null,
  useRaceBonus: true,
};

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollAbilityScore() {
  const rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)];
  rolls.sort((a, b) => a - b);
  rolls.shift(); // drop the lowest
  return rolls.reduce((sum, n) => sum + n, 0);
}

function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

function formatMod(mod) {
  return (mod >= 0 ? "+" : "") + mod;
}

// Matches an option value like "half-elf" to the key "Half-Elf" in races
function getRaceBonuses(value) {
  const key = Object.keys(races).find(
    (k) => k.toLowerCase().replace(/ /g, "-") === value
  );
  return key ? races[key].bonuses : {};
}

function getFinalScores() {
  if (!character.baseScores) return null;
  const bonuses = getRaceBonuses(character.race);
  const final = {};
  abilities.forEach((a) => {
    final[a] = character.baseScores[a] + (bonuses[a] || 0);
  });
  return final;
}
// The two abilities that matter most for each class (best first)
const classBest = {
  artificer: ["Intelligence", "Constitution"],
  barbarian: ["Strength", "Constitution"],
  bard: ["Charisma", "Dexterity"],
  "blood-hunter": ["Strength", "Constitution"],
  cleric: ["Wisdom", "Constitution"],
  druid: ["Wisdom", "Constitution"],
  fighter: ["Strength", "Constitution"],
  monk: ["Dexterity", "Wisdom"],
  paladin: ["Strength", "Charisma"],
  ranger: ["Dexterity", "Wisdom"],
  rogue: ["Dexterity", "Constitution"],
  sorcerer: ["Charisma", "Constitution"],
  warlock: ["Charisma", "Constitution"],
  wizard: ["Intelligence", "Constitution"],
};

// Order used for the abilities after the class's two favorites
const fallbackOrder = [
  "Constitution",
  "Dexterity",
  "Wisdom",
  "Charisma",
  "Intelligence",
  "Strength",
];

function autoAssign() {
  const best = classBest[character.class];
  if (!character.baseScores || !best) return;

  const order = [...best, ...fallbackOrder.filter((a) => !best.includes(a))];
  const values = abilities
    .map((a) => character.baseScores[a])
    .sort((x, y) => y - x); // highest first

  const newScores = {};
  order.forEach((a, i) => {
    newScores[a] = values[i];
  });
  character.baseScores = newScores;
  selectedAbility = null;
  render();
}

function updateClassHint() {
  const hint = document.getElementById("class-hint");
  const autoBtn = document.getElementById("auto-btn");
  const best = classBest[character.class];

  hint.textContent = best
    ? `As a ${character.classLabel}, put your highest score in ${best[0]}, then ${best[1]}.`
    : "Pick a class to see which abilities matter most.";
  autoBtn.disabled = !(best && character.baseScores);
}

document.getElementById("auto-btn").addEventListener("click", autoAssign);

let selectedAbility = null;

function swapScores(name) {
  if (!selectedAbility) {
    selectedAbility = name;
  } else if (selectedAbility === name) {
    selectedAbility = null;
  } else {
    const base = character.baseScores;
    [base[selectedAbility], base[name]] = [base[name], base[selectedAbility]];
    selectedAbility = null;
  }
  render();
}

function renderScores() {
  const container = document.getElementById("scores");
  container.innerHTML = "";

  const finalScores = getFinalScores();
  if (!finalScores) return;

  const best = classBest[character.class] || [];

  abilities.forEach((name) => {
    const base = character.baseScores[name];
    const bonus = finalScores[name] - base;
    const mod = getModifier(finalScores[name]);
    const badge =
      name === best[0]
        ? `<p class="badge">★ Top priority</p>`
        : name === best[1]
        ? `<p class="badge">☆ Next best</p>`
        : "";

    const card = document.createElement("div");
    card.className =
      "score-card" + (name === selectedAbility ? " selected" : "");
    card.innerHTML = `
      <h3>${name}</h3>
      <p class="score">${finalScores[name]}</p>
      <p class="mod">${formatMod(mod)}</p>
      <p class="base">Rolled ${base}${bonus ? ` (+${bonus} race)` : ""}</p>
      ${badge}
    `;
    card.addEventListener("click", () => swapScores(name));
    container.appendChild(card);
  });
}

// ----- Connect the Basics fields and the roll button -----
const nameInput = document.getElementById("char-name");
const raceSelect = document.getElementById("character-race");
const classSelect = document.getElementById("character-class");

function selectedText(select) {
  return select.value ? select.options[select.selectedIndex].text : "";
}

nameInput.addEventListener("input", () => {
  character.name = nameInput.value;
  render();
});

raceSelect.addEventListener("change", () => {
  character.race = raceSelect.value;
  character.raceLabel = selectedText(raceSelect);
  render();
});

classSelect.addEventListener("change", () => {
  character.class = classSelect.value;
  character.classLabel = selectedText(classSelect);
  render();
});
const raceBonusBox = document.getElementById("use-race-bonus");

raceBonusBox.addEventListener("change", () => {
  character.useRaceBonus = raceBonusBox.checked;
  render();
});

function rollScores() {
  character.baseScores = {};
  abilities.forEach((a) => {
    character.baseScores[a] = rollAbilityScore();
  });
  selectedAbility = null;
  render();
}

document.getElementById("roll-btn").addEventListener("click", () => {
  if (
    character.baseScores &&
    !confirm("You already rolled. Reroll and replace your scores?")
  )
    return;
  spinDice();
  rollScores();
});
// ----- Beginner descriptions (keys match the option values in the HTML) -----
const raceInfo = {
  aarakocra:
    "Bird-like people with feathered wings who can fly. Fun for scouts and sky-high adventures.",
  aasimar:
    "Carries a spark of celestial light and is often guided by a higher power. A natural fit for healers and champions.",
  autognome:
    "A small mechanical being built by gnomes, free to choose its own path. Quirky and curious.",
  bugbear:
    "Big, long-armed, and surprisingly sneaky. Great for ambushes and heavy hits.",
  centaur:
    "Half human, half horse, fast and strong on open ground. Suits rangers and wanderers.",
  changeling:
    "A shapeshifter who can change their face and voice. Perfect for spies and tricksters.",
  "deep-gnome":
    "A secretive gnome from the underground, good at staying hidden. Quiet, tough, and careful.",
  dhampir:
    "Part vampire, caught between the living and the undead. Moody and mysterious.",
  dragonborn:
    "Proud people with dragon ancestry and a breath weapon. Bold and striking.",
  dwarf:
    "Sturdy and stubborn, hard to knock down. Great if you like tough, steady heroes.",
  elf: "Graceful and long-lived, with sharp senses. Good for quick, clever characters.",
  fairy:
    "A tiny winged being from the world of the fey, playful and magical. Can fly and charm.",
  firbolg:
    "Gentle forest giants who prefer to avoid fights. Great for nature-lovers.",
  genasi:
    "Descended from elemental spirits of fire, water, air, or earth. Great for elemental themes.",
  giff: "Hippo-headed soldiers who love weapons and military order. Strong, loud, and disciplined.",
  githyanki:
    "Fierce warriors from another plane who ride dragons into battle. Proud and martial.",
  githzerai:
    "Disciplined mystics who train their minds like warriors. Calm, sharp, and focused.",
  gnome:
    "Curious inventors and tricksters, full of energy. Great for magic users.",
  goblin:
    "Small and quick, good at slipping away from danger. Perfect for tricksters.",
  goliath: "Tall mountain folk who love competition. Powerful and athletic.",
  grung:
    "Tiny, proud frog-folk from the jungle with poisonous skin. Loyal and unusual.",
  hadozee:
    "Monkey-like explorers with skin flaps that let them glide. Agile and adventurous.",
  "half-elf":
    "A mix of human and elf, at home in both worlds. Charming and versatile.",
  "half-orc":
    "Strong and fierce, with a lot of endurance. Good for front-line fighters.",
  halfling:
    "Small, lucky, and brave. A cheerful pick for sneaky or friendly heroes.",
  harengon:
    "Rabbit-like folk with great reflexes and lucky leaps. Quick and cheerful.",
  hobgoblin:
    "Disciplined soldiers who value order and teamwork. Great for tacticians.",
  human:
    "Adaptable and found everywhere. A simple, flexible choice for a first character.",
  kenku:
    "Crow-like beings who can only copy sounds they've heard. Mysterious and clever.",
  kender:
    "Fearless, curious little folk who love 'borrowing' things. Lighthearted troublemakers.",
  kobold:
    "Small, clever dragon-kin who rely on teamwork and traps. Fun for cunning players.",
  leonin:
    "Lion-like warriors with a proud, honor-driven spirit. Strong and fearless.",
  lizardfolk:
    "Cold-blooded survivors who think in practical, logical ways. Tough and resourceful.",
  loxodon:
    "Wise elephant-like people, calm and strong. Gentle giants with great memory.",
  minotaur:
    "Bull-headed and powerful, charging into battle with their horns. Bold and brutal.",
  orc: "Strong and driven, built for powerful attacks. A bold front-line choice.",
  owlin:
    "Owl-like people with silent flight and sharp night vision. Observant and stealthy.",
  plasmoid:
    "A shapeless, ooze-like being that can squeeze and reshape its body. Weird and flexible.",
  satyr:
    "Playful, goat-legged fey who love music, wine, and fun. Cheerful and carefree.",
  "shadar-kai":
    "Pale, gloomy folk tied to a shadowy realm who face the dark bravely. Moody and tough.",
  shifter:
    "Part-beast folk who can briefly take on animal traits. Wild and quick.",
  tabaxi:
    "Cat-like wanderers, quick and endlessly curious. Great for scouts and rogues.",
  "thri-kreen":
    "Insect-like desert hunters with four arms and a hard shell. Alien and fast.",
  tiefling:
    "Touched by a fiendish bloodline, often misunderstood. Mysterious and charismatic.",
  tortle:
    "Calm turtle folk with a natural shell for protection. Tough and easygoing.",
  triton:
    "Proud sea-dwellers who protect the ocean depths. Great for water adventures.",
  vedalken:
    "Cool-headed, blue-skinned thinkers who love logic. Great for planners.",
  warforged:
    "A living construct built for war, searching for purpose. Unusual and sturdy.",
  "yuan-ti":
    "Snake-like people, cunning and resistant to poison. Often scheming and secretive.",
};

const classInfo = {
  fighter:
    "A master of weapons and armor. Simple to play and tough, so it's great for beginners.",
  barbarian:
    "A fierce warrior who fights in a rage. Easy to learn and hard to take down.",
  paladin:
    "A holy knight who protects allies and smites enemies. Strong and inspiring.",
  ranger: "A hunter and tracker, skilled with a bow and at home in the wilds.",
  rogue:
    "A sneaky expert in stealth, traps, and surprise attacks. Beginner-friendly.",
  monk: "A martial artist who fights with speed and discipline, no weapons needed.",
  cleric:
    "A servant of a god who heals allies and casts divine spells. Always welcome in a party.",
  druid:
    "A nature caster who can turn into animals. Flexible, with lots of options.",
  bard: "A charming performer whose music inspires friends and tricks foes. Great talker.",
  wizard:
    "A scholar who learns a huge range of spells. Powerful, but a bit more complex.",
  sorcerer:
    "Born with magic in their blood. Casts fewer spells, but with natural flair.",
  warlock:
    "Gains magic from a pact with a mysterious patron. Dramatic and unique.",
  artificer:
    "An inventor who creates magical gadgets and gear. Creative and clever.",
  "blood-hunter":
    "A grim monster hunter who fuels abilities with their own blood. Dark and intense.",
};

function setInfoCard(el, icon, label, text) {
  el.innerHTML = label
    ? `<h4>${icon} ${esc(label)}</h4><p>${esc(text)}</p>`
    : "";
}

function updateInfo() {
  setInfoCard(
    document.getElementById("race-info"),
    "🧝",
    character.race ? character.raceLabel : "",
    raceInfo[character.race] ||
      "A less common race. Ask your DM how it works at your table."
  );

  setInfoCard(
    document.getElementById("class-info"),
    "⚔️",
    character.class ? character.classLabel : "",
    classInfo[character.class] || ""
  );
}
// ----- Save and load (localStorage) -----
const SAVE_KEY = "guildRegistryCharacter";
const saveStatus = document.getElementById("save-status");
let saveTimer;
let ready = false;

function showSaveMessage(text) {
  if (!ready) return;
  saveStatus.textContent = text;
  saveStatus.classList.add("visible");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveStatus.classList.remove("visible"), 1500);
}

function saveCharacter() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ character, details }));
    showSaveMessage("Saved ✓");
  } catch (e) {
    showSaveMessage("Couldn't save (storage is blocked)");
  }
}

function loadCharacter() {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch (e) {
    return;
  }
  if (!data || !data.character) return;

  Object.assign(character, data.character);
  Object.assign(details, data.details || {});

  nameInput.value = character.name || "";
  raceSelect.value = character.race || "";
  classSelect.value = character.class || "";
  document.getElementById("use-race-bonus").checked = character.useRaceBonus;
  document.querySelectorAll(".detail").forEach((el) => {
    el.value = details[el.dataset.key] || "";
  });
}

function resetCharacter() {
  if (!confirm("Start a new hero? The current one will be erased.")) return;

  character.name = "";
  character.race = "";
  character.raceLabel = "";
  character.class = "";
  character.classLabel = "";
  character.baseScores = null;
  Object.keys(details).forEach((key) => delete details[key]);

  nameInput.value = "";
  raceSelect.value = "";
  classSelect.value = "";
  document.querySelectorAll(".detail").forEach((el) => {
    el.value = "";
  });

  render();
}

document.getElementById("reset-btn").addEventListener("click", resetCharacter);
// ----- Download the card as an image -----
const downloadBtn = document.getElementById("download-btn");

downloadBtn.addEventListener("click", async () => {
  const cardEl = document.querySelector(".profile-card");
  if (!cardEl) return;

  downloadBtn.disabled = true;
  downloadBtn.textContent = "Creating image...";

  try {
    await document.fonts.ready; // makes sure the fantasy font is loaded
    const canvas = await html2canvas(cardEl, {
      backgroundColor: "#fbf3dd",
      scale: 2, // sharper image
    });

    const fileName =
      (character.name.trim() || "hero")
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase() + ".png";

    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (e) {
    alert("Sorry, the image couldn't be created. Try again.");
  }

  downloadBtn.disabled = false;
  downloadBtn.textContent = "Save card as image";
});

function render() {
  renderScores();
  renderCard();
  updateInfo();
  updateClassHint();
  saveCharacter();
}

loadCharacter();

// Nothing saved yet (or an empty hero): start with a random hero, so the page isn't empty
if (!character.name && !character.race && !character.class) {
  randomizeCharacter();
}

render();
ready = true;
