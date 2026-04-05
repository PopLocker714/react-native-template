import { atom } from "@illuxiza/nanostores-immer";
import type { StoreValue } from "nanostores";
import type { TRoomMembership, TRoomType } from "../../types/room";

interface IRoom {
	id: string;
	title: string;
	type: TRoomType;
	membership: TRoomMembership;
}

export const $rooms = atom(new Map<string, IRoom>());

export type $RoomsType = StoreValue<typeof $rooms>;
export type $RoomItemType = $RoomsType extends Map<string, infer V> ? V : never;
