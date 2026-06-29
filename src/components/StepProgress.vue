<template>
  <div class="step-progress">
    <div class="steps-track">
      <div v-for="i in total" :key="i" class="step-dot" :class="{ active: i === current, done: i < current }">
        <span v-if="i < current" class="done-check">✓</span>
        <span v-else>{{ i }}</span>
      </div>
      <div class="track-line">
        <div class="track-fill" :style="{ width: fillPct + '%' }"></div>
      </div>
    </div>
    <div class="step-labels">
      <span v-for="(label, i) in labels" :key="i" class="step-label" :class="{ active: i + 1 === current }">
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ current: { type: Number, required: true }, total: { type: Number, required: true } })
const labels = ['Źródło', 'Zakres', 'Przegląd', 'Skan']
const fillPct = computed(() => ((props.current - 1) / (props.total - 1)) * 100)
</script>

<style scoped>
.step-progress { margin-bottom: 24px; }
.steps-track { display: flex; align-items: center; position: relative; }
.track-line {
  flex: 1; height: 2px; background: var(--color-border);
  position: absolute; left: 16px; right: 16px; top: 50%; transform: translateY(-50%); z-index: 0;
}
.track-fill { height: 100%; background: var(--color-primary); transition: width 0.4s ease; }
.step-dot {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-surface-2); border: 2px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--color-text-muted);
  position: relative; z-index: 1; transition: all 0.2s; flex-shrink: 0;
}
.step-dot:not(:last-child) { margin-right: calc(25% - 32px); }
.step-dot.active { border-color: var(--color-primary); background: var(--color-primary); color: white; box-shadow: 0 0 0 4px rgba(99,102,241,0.2); }
.step-dot.done { border-color: var(--color-success); background: var(--color-success); color: white; }
.step-labels { display: flex; justify-content: space-between; margin-top: 8px; }
.step-label { font-size: 11px; color: var(--color-text-muted); text-align: center; width: 32px; transition: color 0.2s; }
.step-label.active { color: var(--color-primary); font-weight: 600; }
</style>
