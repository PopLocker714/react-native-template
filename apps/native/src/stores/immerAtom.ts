import { produce } from "immer";
import { atom as nanoAtom, type PreinitializedWritableAtom } from "nanostores";

/**
 * A nanostores atom extended with an Immer-powered `mut` method.
 *
 * Replaces `@illuxiza/nanostores-immer`, which ships stale nanostores type
 * declarations (missing `init`) and is incompatible with nanostores >= 1.1.
 * The runtime behaviour is identical: `mut` produces the next immutable value
 * via Immer and commits it through the standard `set`, so React bindings and
 * lifecycle hooks keep working.
 */
export type ImmerAtom<Value> = PreinitializedWritableAtom<Value> & {
	mut(mutater: (draft: Value) => void): void;
};

export function atom<Value>(initialValue: Value): ImmerAtom<Value> {
	const $atom = nanoAtom(initialValue) as ImmerAtom<Value>;

	$atom.mut = (mutater) => {
		const oldValue = $atom.get();
		const newValue = produce(oldValue, mutater);
		if (oldValue !== newValue) {
			$atom.set(newValue);
		}
	};

	return $atom;
}
