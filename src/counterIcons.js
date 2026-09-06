import entryIcon from './assets/entry.png'
import plateIcon from './assets/plate.png'
import modakIcon from './assets/modak.png'
import malpuaIcon from './assets/malpua.png'

export const COUNTER_ICONS = {
  ENTRY: entryIcon,
  PLATE: plateIcon,
  MODAK: modakIcon,
  MALPUA: malpuaIcon,
  MALPOHA: malpuaIcon,
}

export function getCounterIcon(codeOrLabel) {
  if (!codeOrLabel) return null
  const key = String(codeOrLabel).trim().toUpperCase()
  if (COUNTER_ICONS[key]) return COUNTER_ICONS[key]
  if (key.includes('ENTRY')) return entryIcon
  if (key.includes('PLATE') || key.includes('DISH')) return plateIcon
  if (key.includes('MODAK')) return modakIcon
  if (key.includes('MALPUA') || key.includes('MALPOHA')) return malpuaIcon
  return null
}

export { entryIcon, plateIcon, modakIcon, malpuaIcon }
