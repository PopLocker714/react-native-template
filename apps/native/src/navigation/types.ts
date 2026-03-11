import type { $RoomItemType } from "../stores/matrixChat/rooms";

export type RootStackParamList = {
	Home: undefined;
	ChatList: undefined;
	Chat: $RoomItemType;
};

declare global {
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}
