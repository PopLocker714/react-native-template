import type { IRoomTimelineData, MatrixEvent, Room } from "matrix-js-sdk";

export const onTimeLine = (
	event: MatrixEvent,
	room: Room | undefined,
	toStartOfTimeline: boolean | undefined,
	removed: boolean,
	data: IRoomTimelineData,
) => {
	// console.log("--------------------------------");
	// console.log("event.getType()", event.getType());
	// console.log("room?.roomId", room?.roomId);
	// console.log("toStartOfTimeline", toStartOfTimeline);
	// console.log("removed", removed);
	// console.log("data", data);
	// console.log("--------------------------------");
};
