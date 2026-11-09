import type { InteriorId } from '../types';
import { LocationContext } from '../world/parts';
import { NPCs } from '../game/NPC';
import { KonbiniInterior } from './Konbini';
import { RamenInterior } from './Ramen';
import { HouseInterior } from './House';
import { CafeInterior } from './Cafe';
import { BookstoreInterior } from './Bookstore';

const SIZE: Record<InteriorId, [number, number]> = {
  konbini: [14, 10],
  ramen: [10, 8],
  house: [14, 12],
  cafe: [12, 10],
  bookstore: [12, 10],
};

const spawn = (id: InteriorId) => ({ x: 0, z: SIZE[id][1] / 2 - 1.3, yaw: 0 });

/** Point just inside each entrance, looking into the room. */
export const INTERIOR_SPAWN: Record<InteriorId, { x: number; z: number; yaw: number }> = {
  konbini: spawn('konbini'),
  ramen: spawn('ramen'),
  house: spawn('house'),
  cafe: spawn('cafe'),
  bookstore: spawn('bookstore'),
};

const ROOMS: Record<InteriorId, () => React.JSX.Element> = {
  konbini: KonbiniInterior,
  ramen: RamenInterior,
  house: HouseInterior,
  cafe: CafeInterior,
  bookstore: BookstoreInterior,
};

export function Interior({ id }: { id: InteriorId }) {
  const Room = ROOMS[id];
  return (
    <LocationContext.Provider value={id}>
      <Room />
      <NPCs location={id} />
    </LocationContext.Provider>
  );
}
