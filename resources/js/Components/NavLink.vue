<template>
  <Link
    :href="href"
    :class="[
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
      active
        ? 'bg-gray-900 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    ]"
  >
    <slot />
  </Link>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';

defineProps({
  href: String,
  active: Boolean,
});
</script>
