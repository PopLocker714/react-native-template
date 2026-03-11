import { EventTimeline, type SyncState, SyncState as SyncStateEnum } from "matrix-js-sdk";
import { Platform } from "react-native";
import { $Client } from "../../stores/matrixChat/client";
import { $Members, $RoomMembers } from "../../stores/matrixChat/members";
import { $rooms } from "../../stores/matrixChat/rooms";
import type { TRoomType } from "../../types/room";
import { MATRIX_BASE_URL } from "./matrix";

const getRoomTitle = (room: { roomId: string; getDefaultRoomName: (userId: string) => string }, meId: string) => {
	try {
		return room.getDefaultRoomName(meId);
	} catch (error) {
		console.log("matrix room title fallback", room.roomId, error);
		return room.roomId;
	}
};

const onSync = (state: SyncState) => {
	switch (state) {
		case SyncStateEnum.Syncing:
			break;
		case SyncStateEnum.Prepared: {
			const client = $Client.get();
			if (!client) return;
			const meId = client.getUserId();
			if (!meId) return;
			const rooms = client.getRooms();

			const _rooms = rooms.map((room) => {
				const timline = room.getLiveTimeline();
				const creationEvent = timline.getState(EventTimeline.FORWARDS);
				const event = creationEvent?.getStateEvents("m.room.create", "");

				const members = creationEvent?.getMembers();
				if (members) {
					members.forEach((member) => {
						$Members.mut((draft) => {
							const has = draft.has(member.userId);
							if (!has)
								draft.set(member.userId, {
									display_name: member.rawDisplayName,
									username: member.userId,
									avatar: member.getAvatarUrl(client.baseUrl, 128, 128, "crop", false, false),
								});
						});

						$RoomMembers.mut((draft) => {
							const data = draft.get(room.roomId);
							const item = { id: member.userId, membership: member.membership };
							if (data === undefined) {
								draft.set(room.roomId, [item]);
								return;
							}
							data.push(item);
						});
					});
				}

				const isDirect = event?.getContent()?.is_direct;
				return [
					room.roomId,
					{ id: room.roomId, title: getRoomTitle(room, meId), type: isDirect ? "direct" : "group" },
				] as [string, { id: string; title: string; type: TRoomType }];
			});

			$rooms.set(new Map(_rooms));
			break;
		}
		case SyncStateEnum.Reconnecting:
			// console.log([Platform.OS], SyncStateEnum.Reconnecting);
			break;
		case SyncStateEnum.Error:
			console.log([Platform.OS], SyncStateEnum.Error);
			break;
	}
};

export default onSync;
