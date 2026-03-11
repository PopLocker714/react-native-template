import { useStore } from "@nanostores/react";
import { useHeaderHeight } from "@react-navigation/elements";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Text } from "react-native";
import type { IMessage } from "react-native-gifted-chat";
import { GiftedChat } from "react-native-gifted-chat";
import type { RootStackParamList } from "../navigation/types";
import { $Members, $RoomMembers } from "../stores/matrixChat/members";

type Props = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function Chat({ route }: Props) {
	const { id, title, type } = route.params;
	const roomMemebers = useStore($RoomMembers).get(id);
	const members = useStore($Members);

	const membersByChat = roomMemebers?.map((mbid) => ({ ...members.get(mbid.id), membership: mbid.membership }));

	const [messages, setMessages] = useState<IMessage[]>([]);

	// keyboardVerticalOffset = distance from screen top to GiftedChat container
	// useHeaderHeight() returns status bar + navigation header height
	const headerHeight = useHeaderHeight();

	useEffect(() => {
		setMessages([
			{
				_id: 1,
				text: "Hello developer",
				createdAt: new Date(),
				user: {
					_id: 2,
					name: "John Doe",
					avatar: "https://placeimg.com/140/140/any",
				},
			},
		]);
	}, []);

	const onSend = useCallback((messages: IMessage[] = []) => {
		setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
	}, []);

	return (
		<>
			{membersByChat?.map((member) =>
				member ? <Text key={member.username}>{`${member.display_name} ${member.membership}`}</Text> : null,
			)}
			<GiftedChat
				messages={messages}
				onSend={(messages) => onSend(messages)}
				user={{
					_id: 1,
				}}
				keyboardAvoidingViewProps={{ keyboardVerticalOffset: headerHeight }}
			/>
		</>
	);
}
