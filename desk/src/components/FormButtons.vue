<template>
	<div class="flex items-center gap-2">
		<template v-for="button in buttons" :key="button.name">
			<!-- Single Button -->
			<Button
				v-if="!isButtonGroup(button)"
				size="sm"
				:variant="button.variant"
				:disabled="button.disabled"
				@click="handleButtonClick(button)"
			>
				<span v-if="button.icon" class="text-base">{{ button.icon }}</span>
				{{ button.label }}
			</Button>

			<!-- Grouped Button with Popover -->
			<ButtonGroupPopover
				v-else
				:label="button.label"
				:buttons="button.buttons"
				:icon="button.icon"
				:variant="button.variant"
				@execute="emit('execute', $event)"
			/>
		</template>
	</div>
</template>

<script setup lang="ts">
import ButtonGroupPopover from "./ButtonGroupPopover.vue";
import type { CustomFormButton, FormButton, FormButtonGroup } from "../composables/useFormButtons";
import Button from "./Button.vue";

interface Props {
	buttons: CustomFormButton[];
}

withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
	execute: [button: FormButton];
}>();

function isButtonGroup(button: CustomFormButton): button is FormButtonGroup {
	return "buttons" in button && Array.isArray((button as FormButtonGroup).buttons);
}

async function handleButtonClick(button: FormButton) {
	try {
		await button.onClick();
		emit("execute", button);
	} catch (error) {
		console.error("Button action failed:", error);
	}
}
</script>

<style scoped></style>
