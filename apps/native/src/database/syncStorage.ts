import { open, openSync } from "@op-engineering/op-sqlite";
import { drizzle } from "drizzle-orm/op-sqlite";
import { migrate } from "drizzle-orm/op-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { $SEvents } from "../stores/events";
import schema from "./index";

export const getLocalDb = () => {
	const db = open({ name: "local" });

	const drzlDb = drizzle(db, { schema });

	// migrate(drzlDb, migrations)
	// 	.then(() => console.log("migration success!"))
	// 	.catch((e) => console.log(e));

	return drzlDb;
};

export const getLibsqlDb = () => {
	// const remoteDb = openSync({
	// 	name: "s1_global",
	// 	url: "http://localhost:7017",
	// 	authToken:
	// 		"eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJpZDowMTljMTNlYy1iNzIyLTcwMDAtYjZhYy01ZDA4Yjk1NDVjZGMiLCJleHAiOjE3NzI0NTI4MDZ9.Ei-qx87D-ZLoACVT0Xiwkltroe_jo3jfcfSejlB4N8oC0j-bKlYtXtcPJbeArwu-BcS8FYSZPKiFcH3UX7IzDA",
	// 	libsqlSyncInterval: 1,
	// });
	// const drzlDb = drizzle(remoteDb, { schema });
	// drzlDb.query.$TEvents.findMany().then((data) => {
	// 	console.log(data.length);
	// 	$SEvents.set(data);
	// });
	// setInterval(() => {
	// 	remoteDb.sync();
	// 	drzlDb.query.$TEvents.findMany().then((data) => {
	// 		console.log(data.length);
	// 		$SEvents.set(data);
	// 	});
	// }, 1000);
	// migrate(drzlDb, migrations)
	// 	.then(() => console.log("migration success!"))
	// 	.catch((e) => console.log(e));
	// return drzlDb;
};
