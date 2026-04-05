import type { MatrixClient } from "matrix-js-sdk";
import { atom } from "nanostores";

export const $Client = atom<MatrixClient | null>(null);
export const $ClientStates = atom<{ isPrepared: boolean }>({ isPrepared: false });
