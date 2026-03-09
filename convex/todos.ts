import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("todos").withIndex("by_createdAt").order("desc").collect();
	},
});

export const create = mutation({
	args: { text: v.string() },
	handler: async (ctx, { text }) => {
		const normalizedText = text.trim();
		if (!normalizedText) {
			throw new Error("Todo text cannot be empty.");
		}

		await ctx.db.insert("todos", {
			text: normalizedText,
			isCompleted: false,
			createdAt: Date.now(),
		});
	},
});

export const toggle = mutation({
	args: { id: v.id("todos") },
	handler: async (ctx, { id }) => {
		const todo = await ctx.db.get(id);
		if (!todo) {
			return;
		}

		await ctx.db.patch(id, { isCompleted: !todo.isCompleted });
	},
});

export const remove = mutation({
	args: { id: v.id("todos") },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	},
});
