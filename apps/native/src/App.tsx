import { HotUpdater } from "@hot-updater/react-native";
import { Button } from "@react-navigation/elements";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from "convex/react";
import type { FunctionReference } from "convex/server";
import { useState } from "react";
import { FlatList, Pressable, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api as generatedApi } from "../../../convex/_generated/api";
import type { RootStackParamList } from "./navigation/types";
import ChatScreen from "./screens/chat";
import ChatListScreen from "./screens/chatList";

declare const process: { env: Record<string, string | undefined> };

const convexUrl = process.env.CONVEX_URL ?? "";
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

type Todo = {
	_id: string;
	text: string;
	isCompleted: boolean;
	createdAt: number;
};

type TodoApi = {
	todos: {
		list: FunctionReference<"query">;
		create: FunctionReference<"mutation">;
		toggle: FunctionReference<"mutation">;
		remove: FunctionReference<"mutation">;
	};
};

const api = generatedApi as unknown as TodoApi;

function TodoList() {
	const todos = (useQuery(api.todos.list, {}) as Todo[] | undefined) ?? [];
	const createTodo = useMutation(api.todos.create);
	const toggleTodo = useMutation(api.todos.toggle);
	const removeTodo = useMutation(api.todos.remove);
	const [newTodoText, setNewTodoText] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const onAddTodo = async () => {
		const normalizedText = newTodoText.trim();
		if (!normalizedText || isCreating) {
			return;
		}

		setIsCreating(true);
		try {
			await createTodo({ text: normalizedText });
			setNewTodoText("");
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<Text style={styles.title}>Convex Todo List</Text>

			<View style={styles.inputRow}>
				<TextInput
					value={newTodoText}
					onChangeText={setNewTodoText}
					placeholder="Новая задача..."
					style={styles.input}
				/>
				<Pressable
					disabled={!newTodoText.trim() || isCreating}
					onPress={onAddTodo}
					style={({ pressed }) => [
						styles.addButton,
						(!newTodoText.trim() || isCreating) && styles.addButtonDisabled,
						pressed && styles.addButtonPressed,
					]}
				>
					<Text style={styles.addButtonText}>{isCreating ? "..." : "Добавить"}</Text>
				</Pressable>
			</View>

			<FlatList
				data={todos}
				keyExtractor={(todo) => todo._id}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={<Text style={styles.emptyText}>Пока задач нет.</Text>}
				renderItem={({ item }) => (
					<View style={styles.todoRow}>
						<Pressable onPress={() => toggleTodo({ id: item._id })} style={styles.todoMainButton}>
							<Text style={[styles.todoText, item.isCompleted && styles.todoTextDone]}>{item.text}</Text>
						</Pressable>
						<Pressable onPress={() => removeTodo({ id: item._id })} style={styles.deleteButton}>
							<Text style={styles.deleteButtonText}>Удалить</Text>
						</Pressable>
					</View>
				)}
			/>
		</SafeAreaView>
	);
}

function HomeScreen() {
	return (
		<View style={{ flex: 1 }}>
			<Text>Home Screen</Text>
			<Button screen={"ChatList"}>gotoChatlist</Button>
			<TodoList />
		</View>
	);
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootStack() {
	return (
		<Stack.Navigator initialRouteName="Home">
			<Stack.Screen name="Home" component={HomeScreen} />
			<Stack.Screen name="ChatList" component={ChatListScreen} />
			<Stack.Screen name="Chat" component={ChatScreen} />
		</Stack.Navigator>
	);
}

function App() {
	if (!convexClient) {
		return (
			<SafeAreaView style={styles.container}>
				<StatusBar barStyle="dark-content" />
				<Text style={styles.title}>Convex Todo List</Text>
				<Text style={styles.errorTitle}>Не найден CONVEX_URL</Text>
				<Text style={styles.errorText}>Перед запуском укажи переменную окружения CONVEX_URL.</Text>
			</SafeAreaView>
		);
	}

	return (
		<ConvexProvider client={convexClient}>
			<NavigationContainer>
				<RootStack />
			</NavigationContainer>
		</ConvexProvider>
	);
}

export default HotUpdater.wrap({
	baseURL: `http://localhost:3000/hot-updater`,
	updateMode: "manual",
})(App);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f2f4f8",
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		color: "#111827",
		marginBottom: 16,
	},
	inputRow: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 12,
	},
	input: {
		flex: 1,
		backgroundColor: "#ffffff",
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: "#d1d5db",
		color: "#111827",
	},
	addButton: {
		backgroundColor: "#2563eb",
		borderRadius: 12,
		paddingHorizontal: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	addButtonDisabled: {
		backgroundColor: "#9ca3af",
	},
	addButtonPressed: {
		opacity: 0.8,
	},
	addButtonText: {
		color: "#ffffff",
		fontWeight: "600",
	},
	listContent: {
		paddingBottom: 24,
		gap: 10,
	},
	emptyText: {
		textAlign: "center",
		color: "#6b7280",
		marginTop: 24,
	},
	todoRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	todoMainButton: {
		flex: 1,
		backgroundColor: "#ffffff",
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#e5e7eb",
	},
	todoText: {
		fontSize: 16,
		color: "#111827",
	},
	todoTextDone: {
		color: "#6b7280",
		textDecorationLine: "line-through",
	},
	deleteButton: {
		backgroundColor: "#fee2e2",
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 8,
	},
	deleteButtonText: {
		color: "#b91c1c",
		fontWeight: "600",
	},
	errorTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#991b1b",
		marginBottom: 8,
	},
	errorText: {
		fontSize: 15,
		color: "#374151",
	},
});
