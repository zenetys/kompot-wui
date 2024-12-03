<template>
    <a v-if="href" :href="href" :target="target" @click.stop>
        <slot></slot>
    </a>
    <router-link v-else :to="to">
        <slot></slot>
    </router-link>
</template>

<script>
export default {
    name: 'ZLink',
    props: {
        href: { type: String, required: false },
        target: { type: String, required: false },
        to: { type: [ String, Object ], required: false },
    },
};
</script>
