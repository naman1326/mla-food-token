import entryIcon from './assets/entry.png'
import plateIcon from './assets/plate.png'
import sweetIcon from './assets/sweet.png'
import drinkIcon from './assets/drink.png'

export const COUNTER_ICONS = {
  ENTRY: entryIcon,
  PLATE: plateIcon,
  SWEET: sweetIcon,
  DRINK: drinkIcon,
  MODAK: sweetIcon,
  MALPUA: sweetIcon,
  MALPOHA: sweetIcon,
}

export function getCounterIcon(codeOrLabel) {
  if (!codeOrLabel) return null
  const key = String(codeOrLabel).trim().toUpperCase()
  if (COUNTER_ICONS[key]) return COUNTER_ICONS[key]
  if (key.includes('ENTRY')) return entryIcon
  if (key.includes('PLATE') || key.includes('DISH')) return plateIcon
  if (key.includes('SWEET') || key.includes('MODAK') || key.includes('MALPUA') || key.includes('MALPOHA')) return sweetIcon
  if (key.includes('DRINK') || key.includes('BEVERAGE') || key.includes('WATER') || key.includes('JUICE')) return drinkIcon
  return null
}

export { entryIcon, plateIcon, sweetIcon, drinkIcon, sweetIcon as modakIcon, sweetIcon as malpuaIcon }
