import type { Room } from "matrix-js-sdk";

// onCreate or invite
const onRoom = (room: Room) => {
	const membership = room.getMyMembership();
	console.log("onRoom", membership, room.roomId, room.summary);
};

export default onRoom;
