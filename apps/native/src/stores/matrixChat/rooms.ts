import { atom } from "@illuxiza/nanostores-immer";
import type { StoreValue } from "nanostores";
import type { TRoomType } from "../../types/room";

export const $rooms = atom(new Map<string, { id: string; title: string; type: TRoomType }>());

export type $RoomsType = StoreValue<typeof $rooms>;
export type $RoomItemType = $RoomsType extends Map<string, infer V> ? V : never;
