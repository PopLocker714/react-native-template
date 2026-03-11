import { atom } from "@illuxiza/nanostores-immer";
import type { StoreValue } from "nanostores";

export const $Members = atom(new Map<string, { username: string; display_name: string; avatar?: string | null }>());
export type $MembersType = StoreValue<typeof $Members>;
export type $MemberType = $MembersType extends Map<string, infer V> ? V : never;

export const $RoomMembers = atom(new Map<string, { id: string; membership?: string }[]>());
export type $RoomMembersType = StoreValue<typeof $RoomMembers>;
export type $RoomMemberType = $RoomMembersType extends Map<string, infer V> ? V : never;
