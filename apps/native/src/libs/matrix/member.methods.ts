import type { MatrixClient, RoomMember } from "matrix-js-sdk";
import { $Members, $RoomMembers } from "../../stores/matrixChat/members";

export const parseMatrixMember = (member: RoomMember, roomId: string, client: MatrixClient) => {
	// const client = clientMx ? clientMx : $Client.get();
	// if (!client) return;

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
		const data = draft.get(roomId);
		const item = { id: member.userId, membership: member.membership };
		if (data === undefined) {
			draft.set(roomId, [item]);
			return;
		}
		data.push(item);
	});
};
