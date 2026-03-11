import { type ICreateRoomOpts, Preset } from "matrix-js-sdk";
import { $Client } from "../../stores/matrixChat/client";
import type { TRoomType } from "../../types/room";

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
