<template>
	<SelectItem
		v-bind="$attrs"
		:class="
			cn(
				'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
				$attrs.class as string,
			)
		"
		:value="value"
	>
		<span class="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
			<SelectItemIndicator>
				<Check class="h-4 w-4" />
			</SelectItemIndicator>
		</span>
		<SelectItemText>
			<slot />
		</SelectItemText>
	</SelectItem>
</template>

<script setup lang="ts">
import { SelectItem, SelectItemIndicator, SelectItemText } from "radix-vue";
import { Check } from "lucide-vue-next";
import { cn } from "@/lib/utils";

defineOptions({
	inheritAttrs: false,
});

defineProps<{
	value: string;
}>();
</script>
