<template>
	<AppLayout>
		<!-- Header -->
		<template #header>
			<div class="flex items-center justify-between gap-4 w-full py-3">
				<h2 class="text-lg font-semibold text-slate-800 dark:text-white">
					{{ doctype
					}}<span class="font-normal text-slate-600 dark:text-slate-400 ml-2">{{
						isNewDocument ? "(New)" : documentName
					}}</span>
				</h2>

				<!-- Custom Form Buttons from Scripts -->
				<FormButtons :buttons="customButtons" @execute="handleButtonExecute" />
			</div>
		</template>

		<!-- Content -->
		<template #content>
			<div class="relative">
				<FormRenderer
					ref="formContext"
					:doctype="doctype"
					:docname="documentName"
					@loading="loading = $event"
				/>

				<!-- Bottom Action Bar -->
				<BottomActionBar
					:show="formContext?.isDirty || false"
					:loading="loading"
					@save="handleSave"
					@discard="handleDiscard"
				/>
			</div>
		</template>
	</AppLayout>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import AppLayout from "../layout/AppLayout.vue";
import { computed, ref, watch } from "vue";
import FormRenderer from "./FormRenderer.vue";
import FormButtons from "../components/FormButtons.vue";
import BottomActionBar from "../components/BottomActionBar.vue";
import { useBreadcrumbStore } from "../stores/breadcrumbs";
import type { FormButton } from "../composables/useFormButtons";

const formContext = ref();
const route = useRoute();
const breadcrumbStore = useBreadcrumbStore();
const loading = ref(false);

const app = computed(() => route.params.app as string);
const doctype = computed(() => route.params.doctype as string);

// Determine if this is a new document or existing document
// New documents use the /new route path
const documentName = computed(() => {
	const param = route.params.name;

	// If route name is explicitly 'NewForm' or param is 'new', it's a new document
	if (route.name === "NewForm" || param === "new") {
		return null;
	}

	// Otherwise, it's an existing document name
	return param as string;
});

const isNewDocument = computed(() => {
	return route.name === "NewForm" || documentName.value === null;
});

const customButtons = computed(() => {
	return formContext.value?.customButtons || [];
});

// Update breadcrumbs
watch(
	[app, doctype, documentName],
	() => {
		breadcrumbStore.setForForm(app.value, doctype.value, documentName.value);
	},
	{ immediate: true },
);

const handleSave = () => {
	if (formContext.value?.handleSave) {
		formContext.value.handleSave();
	}
};

const handleDiscard = () => {
	if (formContext.value?.handleDiscard) {
		formContext.value.handleDiscard();
	}
};

const handleButtonExecute = (button: FormButton) => {
	console.log("Button executed:", button.name);
	// Additional logic can be added here if needed
};
</script>

<style scoped></style>
