<template>
    <div :class="($vuetify.breakpoint.xs) ? 'text-caption' : 'text-breakpoint-subtitle-1'">
        {{this.date}} ~ {{this.time}}
    </div>
</template>

<script>
export default {
    name: 'Time',
    data() {
        return {
            time: '',
            date: '',
        }
    },
    methods: {
        getTime() {
            const date = new Date();
            this.date = this.addZero(date.getDate()) + "/" + this.addZero(parseInt(date.getMonth()+1)) + "/" + date.getFullYear();
            this.time = this.addZero(date.getHours()) + ":" + this.addZero(date.getMinutes() ) + ":" + this.addZero(date.getSeconds());
        },
        addZero(format) {
            return ("0" + format).slice(-2);
        }
    },
    created() {
        setInterval(this.getTime, 1000);
    },
}
</script>