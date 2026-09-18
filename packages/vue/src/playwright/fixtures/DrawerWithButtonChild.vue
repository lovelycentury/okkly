<script setup lang="ts">
import Button from "../../components/Button/Button.vue";
import Drawer from "../../components/Drawer/Drawer.vue";
</script>

<template>
  <Drawer open @close="() => {}">
    <Button>Inside</Button>
  </Drawer>
</template>
