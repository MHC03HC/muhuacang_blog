<script setup lang="ts">
import { contactLinks } from '~/utils/profile'
</script>

<template>
  <ul class="contact-list">
    <li v-for="link in contactLinks" :key="link.key" class="contact-item">
      <span class="contact-icon" aria-hidden="true">
        <svg v-if="link.icon === 'mail'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
          <path d="m3.2 6.4 8.8 6.1 8.8-6.1" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.23.72-.5v-1.78c-2.92.64-3.54-1.24-3.54-1.24-.48-1.22-1.17-1.55-1.17-1.55-.95-.65.07-.64.07-.64 1.06.08 1.61 1.09 1.61 1.09.94 1.6 2.46 1.14 3.06.87.1-.68.37-1.14.67-1.4-2.33-.27-4.78-1.17-4.78-5.2 0-1.15.41-2.09 1.08-2.83-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.88 1.07a9.98 9.98 0 0 1 5.24 0c2-1.35 2.87-1.07 2.87-1.07.58 1.45.22 2.52.11 2.79.68.74 1.08 1.68 1.08 2.83 0 4.04-2.45 4.93-4.8 5.19.38.33.72.97.72 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5Z" />
        </svg>
      </span>
      <span class="contact-body">
        <span class="contact-label">{{ link.label }}</span>
        <a
          class="contact-value contact-value-link"
          :href="link.href"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
        >
          {{ link.display }}
        </a>
      </span>
      <a
        v-if="link.external"
        class="contact-action"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
      >访问</a>
    </li>
  </ul>
</template>
