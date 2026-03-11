import { useStore } from "@nanostores/react";
import { Button } from "@react-navigation/elements";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { matrixInit } from "../libs/matrix/matrix";
import { createRoom } from "../libs/matrix/room.methods";
import type { RootStackParamList } from "../navigation/types";
import { $rooms } from "../stores/matrixChat/rooms";

type Props = NativeStackScreenProps<RootStackParamList, "ChatList">;

export default function ChatListScreen({ navigation }: Props) {
	const rooms = useStore($rooms);

	useEffect(() => {
		matrixInit().catch((error) => {
			console.log("matrixInit failed", error);
		});
	}, []);

	return (
		<View style={{ flex: 1 }}>
			<Text>Chat LIST</Text>
			<Button
				onPress={() => {
					createRoom("direct", { inviteUserIds: ["@admin:convex-tuwunel-e6a70a-203-31-40-13.traefik.me"] });
				}}
			>
				Create direct ROOM
			</Button>
			<FlatList
				data={Array.from(rooms.entries())}
				renderItem={({ item }) => (
					<Pressable
						style={{ padding: 6, borderColor: "blue", borderWidth: 2, width: "100%" }}
						onPress={() => {
							navigation.navigate("Chat", item[1]);
						}}
					>
						<View style={{ flex: 1, flexDirection: "row" }}>
							{item[1].type === "direct" && <Text>(PRIVAT)</Text>}
							<Text>{item[1].title}</Text>
						</View>
					</Pressable>
				)}
				keyExtractor={(item) => item[0]}
			/>
		</View>
	);
}
