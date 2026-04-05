import { EventTimeline, type Room } from "matrix-js-sdk";

export default (room: Room) => {
	const timline = room.getLiveTimeline();
	return timline.getState(EventTimeline.FORWARDS);
};
