import breakfastIcon from '../assets/icons/breakfast.svg'
import seafoodIcon from '../assets/icons/seafood.svg'
import spicyIcon from '../assets/icons/spicy.svg'
import veganIcon from '../assets/icons/vegan.svg'

/** Category filter chips — SVG assets from `src/assets/icons` (design export). */
export const homeCategoryChips = [
  { id: 'breakfast', label: 'Breakfast', iconSrc: breakfastIcon },
  { id: 'vegan', label: 'Vegan', iconSrc: veganIcon },
  { id: 'seafood', label: 'Seafood', iconSrc: seafoodIcon },
  { id: 'spicy', label: 'Spicy', iconSrc: spicyIcon },
] as const
