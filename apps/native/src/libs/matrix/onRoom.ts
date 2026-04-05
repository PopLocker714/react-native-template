import type { MatrixClient, Room } from "matrix-js-sdk";
import { $ClientStates } from "../../stores/matrixChat/client";
import { $rooms } from "../../stores/matrixChat/rooms";
import getTimleneEvents from "../../utils/getTimleneEvents";
import { parseMatrixMember } from "./member.methods";
import { parseMatrixRoom } from "./room.methods";

// onCreate or invite
const onRoom = (room: Room, client: MatrixClient, userId: string) => {
	console.log("_onRoom_", room.roomId);
	if (!$ClientStates.get().isPrepared) return;
	const membership = room.getMyMembership();
	console.log("onRoom", membership, room.roomId);

	$rooms.mut((draft) => {
		const hasRoom = draft.has(room.roomId);
		if (hasRoom) {
			console.log("Комната есть");
		} else {
			console.log("Комнаты нет");
		}

		const roomTimline = getTimleneEvents(room);
		const _room = parseMatrixRoom(room, userId, roomTimline);
		const members = roomTimline?.getMembers();
		if (members) {
			members.forEach((member) => {
				parseMatrixMember(member, room.roomId, client);
			});
		}
		draft.set(_room.id, _room);
	});

	// if (membership === "invite") {
	// 	const roomTimline = getTimleneEvents(room);
	// 	const _room = parseMatrixRoom(room, userId, roomTimline);

	// }
};

export default onRoom;
