import { type ICreateRoomOpts, Preset, type Room, type RoomState } from "matrix-js-sdk";
import { $Client } from "../../stores/matrixChat/client";
import type { $RoomItemType } from "../../stores/matrixChat/rooms";
import type { TRoomType } from "../../types/room";
import getTimleneEvents from "../../utils/getTimleneEvents";

export const createRoom = async (roomType: TRoomType, optons: { inviteUserIds: string[]; title?: string }) => {
	const { inviteUserIds: invite } = optons;
	const client = $Client.get();
	if (!client) return;
	const data = {} as ICreateRoomOpts;

	if (roomType === "direct") {
		data.is_direct = true;
		data.creation_content = {
			is_direct: true,
		};
		if (invite.length > 1) {
			throw new Error("Direct rooms can only have two participants");
		}
	}

	const newRoom = await client.createRoom({
		...data,
		invite,
		preset: Preset.TrustedPrivateChat,
	});

	return newRoom;
};

export const parseMatrixRoom = (room: Room, userId: string, roomState?: RoomState) => {
	const timline = roomState ? roomState : getTimleneEvents(room);
	const event = timline?.getStateEvents("m.room.create", "");
	const membership = room.getMyMembership() as "join" | "leave" | "invite" | "knock";
	const isDirect = event?.getContent()?.is_direct as undefined | boolean;
	const title = room.getDefaultRoomName(userId);

	return {
		id: room.roomId,
		title,
		type: isDirect ? "direct" : "group",
		membership,
	} as $RoomItemType;
};
