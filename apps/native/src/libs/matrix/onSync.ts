import { type MatrixClient, type SyncState, SyncState as SyncStateEnum } from "matrix-js-sdk";
import { Platform } from "react-native";
import { $Client, $ClientStates } from "../../stores/matrixChat/client";
import { type $RoomItemType, $rooms } from "../../stores/matrixChat/rooms";
import getTimleneEvents from "../../utils/getTimleneEvents";
import { parseMatrixMember } from "./member.methods";
import { parseMatrixRoom } from "./room.methods";

const onSync = (state: SyncState, client: MatrixClient, userId: string) => {
	switch (state) {
		case SyncStateEnum.Syncing:
			break;
		case SyncStateEnum.Prepared: {
			const rooms = client.getRooms();
			console.log(rooms);

			const _rooms: [string, $RoomItemType][] = rooms.map((room) => {
				const roomTimline = getTimleneEvents(room);
				const _room = parseMatrixRoom(room, userId, roomTimline);

				const members = roomTimline?.getMembers();
				if (members) {
					members.forEach((member) => {
						parseMatrixMember(member, room.roomId, client);
					});
				}

				return [_room.id, _room] as [string, $RoomItemType];
			});

			$rooms.set(new Map(_rooms));
			$ClientStates.set({ isPrepared: true });

			console.log([Platform.OS], SyncStateEnum.Prepared + " DONE!");
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
