import type { MatrixCall, MatrixClient } from "matrix-js-sdk";
import { atom } from "nanostores";

export const $Client = atom<MatrixClient | null>(null);
