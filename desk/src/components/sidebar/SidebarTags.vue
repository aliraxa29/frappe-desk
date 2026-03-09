<template>
	<div class="p-4 space-y-3">
		<p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
			{{ __("Tags") }}
		</p>

		<!-- Tag chips -->
		<div class="flex flex-wrap gap-1.5 min-h-6">
			<span
				v-for="tag in tags"
				:key="tag"
				class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-muted text-foreground text-xs rounded-full border border-border"
			>
				<span class="leading-none">{{ tag }}</span>
				<button
					@click="removeTag(tag)"
					class="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-red-200 dark:hover:bg-red-800 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
					:aria-label="__('Remove tag')"
				>
					<X class="h-2.5 w-2.5" />
				</button>
			</span>
			<span v-if="tags.length === 0" class="text-xs text-muted-foreground italic">{{
				__("No tags")
			}}</span>
		</div>

		<!-- Add Tag -->
		<div class="flex gap-1.5">
			<input
				v-model="newTag"
				@keydown.enter.prevent="addTag"
				type="text"
				:placeholder="__('Add a tag...')"
				class="flex-1 min-w-0 px-2.5 py-1.5 text-xs border border-border rounded-md bg-background"
			/>
			<button
				@click="addTag"
				:disabled="!newTag.trim()"
				class="px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
			>
				{{ __("Add") }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Document } from "../../types";
import { resource } from "../../utils/resource";
import { useToastStore } from "../../stores/toast";
import X from "../../icons/X.vue";
import { __ } from "../../utils/translate";

interface Props {
	doc: Document | null;
	doctype: string;
}

const props = defineProps<Props>();
const toast = useToastStore();
const newTag = ref("");
const tags = ref<string[]>([]);

async function loadTags() {
	tags.value = [];
	if (!props.doc?.name) return;
	try {
		// _user_tags is a comma-separated string stored on the document
		const response = await resource.call({
			method: "frappe.client.get_value",
			args: {
				doctype: props.doctype,
				fieldname: "_user_tags",
				filters: { name: props.doc.name },
			},
		});
		const raw: string = response.message?._user_tags || "";
		tags.value = raw
			.split(",")
			.map((t: string) => t.trim())
			.filter(Boolean);
	} catch (error) {
		console.error("Failed to load tags:", error);
	}
}

async function addTag() {
	const tagName = newTag.value.trim();
	if (!tagName || !props.doc?.name) return;
	if (tags.value.includes(tagName)) {
		toast.error(__("Duplicate"), __("Tag already added"));
		return;
	}
	try {
		await resource.call({
			method: "frappe.desk.doctype.tag.tag.add_tag",
			args: { tag: tagName, dt: props.doctype, dn: props.doc.name },
		});
		tags.value.push(tagName);
		newTag.value = "";
	} catch (error) {
		toast.error(__("Error"), __("Could not add tag"));
	}
}

async function removeTag(tag: string) {
	if (!props.doc?.name) return;
	try {
		await resource.call({
			method: "frappe.desk.doctype.tag.tag.remove_tag",
			args: { tag, dt: props.doctype, dn: props.doc.name },
		});
		tags.value = tags.value.filter((t) => t !== tag);
	} catch (error) {
		toast.error(__("Error"), __("Could not remove tag"));
	}
}

watch(() => props.doc?.name, loadTags, { immediate: true });
</script>
