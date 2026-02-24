<template>
	<Link
		:field="field"
		:model-value="ctx.doc?.[field.fieldname] ?? ''"
		:fetch-fields="fetchSourceFields"
		@update:model-value="onUpdate"
		@validated="onValidated"
	/>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Field, FormContext } from "../../types";
import Link from "../controls/Link.vue";

const props = defineProps<{ field: Field; ctx: FormContext }>();
const emit = defineEmits<{ fieldChange: [value: any] }>();

/**
 * Build a fetch map from sibling fields whose `fetch_from` references this link field.
 *
 * `fetch_from` has the format: "link_fieldname.source_field"
 * e.g. field "customer_name" has fetch_from = "customer.customer_name"
 * meaning: when the "customer" Link field changes, fetch "customer_name"
 * from the linked Customer doc and set it on the "customer_name" field.
 *
 * Returns: { target_fieldname: source_fieldname }
 */
const fetchMap = computed<Record<string, string>>(() => {
	const map: Record<string, string> = {};
	const myFieldname = props.field.fieldname;

	// Only proceed if we have access to sibling fields
	if (!props.ctx?.fields) return map;

	// Allowed fieldtypes that can have fetch_from applied
	const allowedTypes = new Set([
		"Data",
		"Read Only",
		"Text",
		"Small Text",
		"Currency",
		"Check",
		"Text Editor",
		"Attach Image",
		"Code",
		"Link",
		"Float",
		"Int",
		"Date",
		"Datetime",
		"Select",
		"Duration",
		"Time",
	]);

	for (const df of props.ctx.fields) {
		if (!df.fetch_from || !df.fetch_from.includes(".")) continue;

		const [linkField, sourceField] = df.fetch_from.split(".");
		if (linkField !== myFieldname) continue;

		// Only apply to read-only-ish fields or fields with certain types
		const isEligible =
			allowedTypes.has(df.fieldtype) || df.read_only === 1 || df.is_virtual === 1;
		if (!isEligible) continue;

		map[df.fieldname] = sourceField;
	}

	return map;
});

/** Source field names to pass to validate_link for fetching */
const fetchSourceFields = computed<string[]>(() => {
	return [...new Set(Object.values(fetchMap.value))];
});

function onUpdate(value: any) {
	props.ctx.set_value(props.field.fieldname, value);
	emit("fieldChange", value);
}

/**
 * Handle validated event from Link control.
 * Sets fetched values on dependent fields using the fetch map.
 */
function onValidated(payload: { value: string; fetchedValues: Record<string, any> }) {
	const map = fetchMap.value;
	if (!Object.keys(map).length) return;

	for (const [targetField, sourceField] of Object.entries(map)) {
		// When clearing the link, clear dependent fields too
		const fetchedValue = payload.value ? payload.fetchedValues[sourceField] ?? "" : "";
		props.ctx.set_value(targetField, fetchedValue);
	}
}
</script>
