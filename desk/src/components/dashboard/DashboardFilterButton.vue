<template>
    <div class="flex items-center gap-3 flex-wrap">
        <!-- Filter Label -->
        <div v-if="label" class="text-sm font-medium text-slate-700 dark:text-slate-300">
            {{ label }}:
        </div>

        <!-- Filter Items -->
        <div class="flex items-center gap-2 flex-wrap">
            <button v-for="item in items" :key="item.value" @click="toggle(item.value)" :class="[
                'px-4 py-2 rounded-lg border font-medium text-sm transition-all duration-200',
                isSelected(item.value)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
            ]">
                {{ item.label }}
            </button>

            <!-- Clear Button -->
            <button v-if="selectedValues.length > 0 && clearable" @click="clear"
                class="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-medium transition-colors">
                Clear
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface FilterItem {
    label: string
    value: string | number
}

interface Props {
    modelValue?: (string | number)[]
    items: FilterItem[]
    label?: string
    multiple?: boolean
    clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    multiple: true,
    clearable: true
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: (string | number)[]): void
    (e: 'change', value: (string | number)[]): void
}>()

const selectedValues = computed({
    get: () => props.modelValue || [],
    set: (value) => {
        emit('update:modelValue', value)
        emit('change', value)
    }
})

function isSelected(value: string | number): boolean {
    return selectedValues.value.includes(value)
}

function toggle(value: string | number) {
    let newValues: (string | number)[]

    if (props.multiple) {
        if (isSelected(value)) {
            newValues = selectedValues.value.filter(v => v !== value)
        } else {
            newValues = [...selectedValues.value, value]
        }
    } else {
        newValues = isSelected(value) ? [] : [value]
    }

    selectedValues.value = newValues
}

function clear() {
    selectedValues.value = []
}
</script>
