import type { MatrixClient, MatrixEvent, Room } from "matrix-js-sdk";
import { $ClientStates } from "../../stores/matrixChat/client";
import { $rooms } from "../../stores/matrixChat/rooms";
import getTimleneEvents from "../../utils/getTimleneEvents";
import { parseMatrixMember } from "./member.methods";
import { parseMatrixRoom } from "./room.methods";

export const onTimeLine = (event: MatrixEvent, room: Room | undefined, userId: string, client: MatrixClient) => {
	if (!$ClientStates.get().isPrepared) return;
	const eventType = event.getType();
	console.log({
		"event.getType()": event.getType(),
		"room?.roomId": room?.roomId,
	});

	if (eventType === "m.room.member") {
		const content = event.getContent();
		if (content.membership === "join") {
			console.log("User joined:", event.getStateKey());

			if (room) {
				$rooms.mut((draft) => {
					const hasRoom = draft.has(room.roomId);
					if (hasRoom) {
						console.log("Комната есть");
						const roomTimline = getTimleneEvents(room);
						const _room = parseMatrixRoom(room, userId, roomTimline);
						const members = roomTimline?.getMembers();
						if (members) {
							members.forEach((member) => {
								parseMatrixMember(member, room.roomId, client);
							});
						}
						draft.set(_room.id, _room);
					}
				});
			}
		}
	}
};
