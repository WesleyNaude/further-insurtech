import type { Corridor } from './types'

/**
 * Cape Town corridors. Coordinates are real alignments, simplified.
 * Fares are shaped on published operator fares, including the genuine
 * off-peak discount those operators already offer. We do not set prices.
 */
export const CORRIDORS: Corridor[] = [
  {
    id: 'khay-cbd',
    name: 'Central Line',
    fromName: 'Khayelitsha',
    toName: 'CBD',
    metres: 32400,
    modes: ['train', 'taxi'],
    fares: { peak: 2150, offPeak: 1450 },
    path: [
      [18.6920, -34.0403], [18.6612, -34.0221], [18.6280, -34.0050],
      [18.5901, -33.9932], [18.5482, -33.9810], [18.5090, -33.9650],
      [18.4770, -33.9480], [18.4531, -33.9330], [18.4231, -33.9221],
    ],
  },
  {
    id: 'bell-cbd',
    name: 'Northern Line',
    fromName: 'Bellville',
    toName: 'CBD',
    metres: 23100,
    modes: ['train', 'taxi'],
    fares: { peak: 1750, offPeak: 1150 },
    path: [
      [18.6290, -33.9020], [18.5980, -33.9080], [18.5640, -33.9130],
      [18.5300, -33.9180], [18.4960, -33.9200], [18.4620, -33.9210],
      [18.4231, -33.9221],
    ],
  },
  {
    id: 'tblv-cbd',
    name: 'MyCiTi T01',
    fromName: 'Table View',
    toName: 'CBD',
    metres: 18600,
    modes: ['bus'],
    fares: { peak: 2080, offPeak: 1390 },
    path: [
      [18.4900, -33.8200], [18.4830, -33.8420], [18.4750, -33.8650],
      [18.4640, -33.8880], [18.4500, -33.9040], [18.4360, -33.9150],
      [18.4231, -33.9221],
    ],
  },
  {
    id: 'clar-cbd',
    name: 'Southern Line',
    fromName: 'Claremont',
    toName: 'CBD',
    metres: 10900,
    modes: ['train', 'bus'],
    fares: { peak: 1350, offPeak: 950 },
    path: [
      [18.4650, -33.9850], [18.4620, -33.9690], [18.4560, -33.9540],
      [18.4470, -33.9400], [18.4360, -33.9300], [18.4231, -33.9221],
    ],
  },
  {
    id: 'seap-cbd',
    name: 'Sea Point promenade',
    fromName: 'Sea Point',
    toName: 'CBD',
    metres: 4300,
    modes: ['cycle', 'walk', 'bus'],
    fares: { peak: 1090, offPeak: 800 },
    path: [
      [18.3840, -33.9200], [18.3930, -33.9160], [18.4030, -33.9140],
      [18.4110, -33.9170], [18.4231, -33.9221],
    ],
  },
]

export const corridorById = (id: string) => CORRIDORS.find((c) => c.id === id)

/** Cape Town CBD, the shared destination. Used to centre maps. */
export const CBD: [number, number] = [18.4231, -33.9221]
