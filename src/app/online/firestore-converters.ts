import {DocumentData, FirestoreDataConverter, QueryDocumentSnapshot} from 'firebase/firestore';
import {HandDoc, PresenceDoc, PrivateRoomState, PublicRoomState, RoomActionData} from './online.model';

/**
 * Firestore's client SDK works with untyped DocumentData; these converters are the single,
 * justified place where that data is cast back to our known document shapes, so the rest of the
 * online feature can work with strict types without scattering `as` casts.
 */
function converterFor<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore: (value: T): DocumentData => value,
    fromFirestore: (snapshot: QueryDocumentSnapshot): T => snapshot.data() as T
  };
}

export const roomConverter = converterFor<PublicRoomState>();
export const privateStateConverter = converterFor<PrivateRoomState>();
export const handConverter = converterFor<HandDoc>();
export const actionConverter = converterFor<RoomActionData>();
export const presenceConverter = converterFor<PresenceDoc>();
