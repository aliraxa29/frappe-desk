<template>
    <button :type="type" :disabled="disabled || loading" :class="buttonClasses">
        <svg v-if="loading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>

        <span class="inline-flex items-center gap-2">
            <slot />
        </span>
    </button>
</template>

<script setup lang="ts">
import { computed } from "vue"

type ButtonVariant = "primary" | "secondary" | "outline" | "danger"
type ButtonSize = "sm" | "md" | "lg"

const props = withDefaults(
    defineProps<{
        variant?: ButtonVariant
        size?: ButtonSize
        disabled?: boolean
        loading?: boolean
        type?: "button" | "submit" | "reset"
    }>(),
    {
        variant: "primary",
        size: "md",
        disabled: false,
        loading: false,
        type: "button",
    }
)

const baseClasses =
    "inline-flex cursor-pointer items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]"

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        "bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500",
    secondary:
        "bg-slate-800 text-white hover:bg-slate-700 focus:ring-slate-500",
    outline:
        "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400 dark:focus:ring-slate-600",
    danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-13 px-7 text-base",
}

const disabledClasses =
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"

const buttonClasses = computed(() => [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    disabledClasses,
])
</script>
