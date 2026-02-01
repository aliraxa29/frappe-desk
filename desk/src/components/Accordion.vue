<script setup lang="ts">
import {
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionRoot,
    AccordionTrigger
} from 'reka-ui'


</script>

<template>
    <AccordionRoot>
        <AccordionItem value="item-1">
            <AccordionHeader>
                <AccordionTrigger />
            </AccordionHeader>
            <AccordionContent />
        </AccordionItem>
    </AccordionRoot>
</template>