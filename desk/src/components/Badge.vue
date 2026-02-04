<template>
    <span :class="pillClasses" role="status" @click="handleClick">
        <span class="flex items-center gap-1.5">
            <slot />
        </span>

        <!-- Close button -->
        <button v-if="closable" type="button" class="ml-1 rounded-full p-0.5 transition hover:bg-black/10"
            @click.stop="$emit('close')">
            <svg viewBox="0 0 20 20" class="h-3.5 w-3.5" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414
             1.414L11.414 10l4.293 4.293a1 1 0 01-1.414
             1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414
             -1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
        </button>
    </span>
</template>

<script setup lang="ts">
import { computed } from "vue"

type PillVariant = "primary" | "success" | "warning" | "danger" | "neutral" | "orange"
type PillSize = "sm" | "md"

const emit = defineEmits<{
    (e: "click"): void
    (e: "close"): void
}>()

const props = withDefaults(
    defineProps<{
        variant?: PillVariant
        size?: PillSize
        clickable?: boolean
        closable?: boolean
    }>(),
    {
        variant: "neutral",
        size: "md",
        clickable: false,
        closable: false,
    }
)

const baseClasses =
    "inline-flex items-center rounded-full font-medium transition-all duration-200 select-none"

const variantClasses: Record<PillVariant, string> = {
    primary: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-200",
    success: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200",
    warning: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200",
    danger: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200",
    neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    orange: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200",
}

const sizeClasses: Record<PillSize, string> = {
    sm: "h-6 px-2.5 text-xs",
    md: "h-7 px-3 text-sm",
}

const interactiveClasses =
    "cursor-pointer hover:brightness-95 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-offset-1"

const pillClasses = computed(() => [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.clickable && interactiveClasses,
])

function handleClick() {
    if (props.clickable) {
        emit("click")
    }
}
</script>
