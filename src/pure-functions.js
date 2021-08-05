export let emptyModel = {
  heldKeys: [],
  modifiers: new Set(),
  strokes: [],
  pausedForMeta: false, // See note below re: Meta
  pendingDispatches: []
}

const shiftOnly = (modifiers) => modifiers.has("Shift") && modifiers.size === 1;
const altOnly = (modifiers) => modifiers.has("Alt") && modifiers.size === 1;

// ↓ "Meta" not supported because of OS issues (see links ↓).
//   Basically, Keystroke leaves all ⌘ shortcuts to the browser.
//   https://stackoverflow.com/a/27512489/230615
//   https://codepen.io/alexduloz/pen/nteqG
const validMods = ["Shift", "Control", "Alt"];

/*
TODO: Migrate this ↑ and this ↓ to README
  * 2+ held keys triggers heldKeys.
  *
  * Single character entry triggers a single stroke.
  * Single characters often come through modified by Shift or Alt.
  *
  * Such cases also get reported as combos. Combos represent any
  * keypress accompanied by still-held modifiers.
  */
const maybeCreateDispatches = (key, model = emptyModel) => {
  if (model.pausedForMeta) return model;

  let m = { ...model }

  if (m.heldKeys.length > 1) {
    const v = { name: "heldKeys", value: m.heldKeys.map(k => k.key) }
    m.pendingDispatches.push(v);
  }

  if (shiftOnly || altOnly || !modifiers.size) {
    m.strokes.push(key);
    m.pendingDispatches.push({ name: "stroke", value: key });
    m.pendingDispatches.push({ name: key, value: key }) // Allows bindings such as <Keystroke on:Enter={…} />
  }

  if (m.modifiers.size) {
    const matchValidModOrder = (l, r) =>
      validMods.indexOf(l) > validMods.indexOf(r);
    m.pendingDispatches.push({ name: "combo", value: Array.from(m.modifiers).sort(matchValidModOrder).join("+") + "+" + key })
  }

  return m
};

export const down = (e, model) => {
  const key = e.key;
  const keyCode = e.keyCode;
  let m = { ...model }

  if (key === "Meta") {
    m.pausedForMeta = true;
  }

  if (m.pausedForMeta) {
    m.heldKeys = []
  } else {
    const alreadyInThere = m.heldKeys.filter(k => k.keyCode === keyCode).length
    if (!alreadyInThere) {
      m.heldKeys.push({ key, keyCode })
    }
  }

  if (validMods.includes(key)) {
    m.modifiers.add(key);
  }

  return maybeCreateDispatches(key, m);
};

export const up = (e, model) => {
  const key = e.key;
  const keyCode = e.keyCode;
  let m = { ...model }

  if (key === "Meta") {
    m.pausedForMeta = false;
  }

  m.modifiers.delete(key);
  // Can't use `delete` here ↓ cause objs in sets are compared by reference.
  m.heldKeys = m.heldKeys.filter(el => el.keyCode !== keyCode)

  return m
};