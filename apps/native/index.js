import { enableMapSet } from "immer";
import { install } from "react-native-quick-crypto";

install();

enableMapSet();

import { AppRegistry } from "react-native";

import { name as appName } from "./app.json";
import App from "./src/App";

AppRegistry.registerComponent(appName, () => App);
