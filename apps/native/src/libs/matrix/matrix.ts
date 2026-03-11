import * as sdk from "matrix-js-sdk";
import { ClientEvent, type ICreateClientOpts, RoomEvent } from "matrix-js-sdk";
import { Platform } from "react-native";
import { $Client } from "../../stores/matrixChat/client";
import onRoom from "./onRoom";
import onSync from "./onSync";
import { onTimeLine } from "./onTimeLine";

const MATRIX_HOST = "tuwunel.mooo.com";
export const MATRIX_BASE_URL = `${"https"}://${MATRIX_HOST}`;

const commonClientOptions = {
	baseUrl: MATRIX_BASE_URL,
	// disableVoip: true,
	// usingExternalCrypto: true,
} as const;

const adroidUser = {
	...commonClientOptions,
	accessToken: "7DivD0EGQXF68urylaoPFNbgHzpO7a8R",
	deviceId: "Fsa2NbALSx",
	userId: "@sigma:convex-tuwunel-e6a70a-203-31-40-13.traefik.me",
} as ICreateClientOpts;

const iphoneUser = {
	...commonClientOptions,
	accessToken: "XbZZ6kTvhYbwyMdlI8bfHSRlsUE3oSAh",
	deviceId: "bg1CoU1Bwz",
	userId: "@admin:convex-tuwunel-e6a70a-203-31-40-13.traefik.me",
} as ICreateClientOpts;

export const matrixInit = async () => {
	const client = sdk.createClient(Platform.OS === "android" ? adroidUser : iphoneUser);
	$Client.set(client);

	client.on(ClientEvent.Sync, onSync);

	console.log("START_INIT");
	client.on(RoomEvent.Timeline, onTimeLine);
	client.on(ClientEvent.Room, onRoom);
	client.on(ClientEvent.SyncUnexpectedError, (error) => {
		console.log("sync error", error);
	});
	await client.startClient({ initialSyncLimit: 10 }).catch((e) => console.log(e));
	console.log("START_INIT_DONE");

	// const res = await client.loginRequest({
	// 	type: "m.login.password",
	// 	identifier: {
	// 		type: "m.id.user",
	// 		user: "@admin:convex-tuwunel-e6a70a-203-31-40-13.traefik.me",
	// 	},
	// 	password: "admin",
	// device_id: "Fsa2NbALSx",
	// });

	// REGISTRATION
	// const res = await client.registerRequest({
	// 	username: "sigma",
	// 	password: "sigma",
	// 	auth: {
	// 		type: "m.login.registration_token",
	// 		token: "yprqfptzeqqxovo1rhvmg0gewgslgkdd",
	// 	},
	// });

	// console.log(res);
	return client;
};
