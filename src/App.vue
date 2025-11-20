<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from './ui/store/gameStore';

const gameStore = useGameStore();

onMounted(() => {
  gameStore.init();
});
</script>

<template>
  <div class="h-screen bg-gray-900 text-white p-8 font-mono flex flex-col">
    <div class="max-w-5xl mx-auto w-full">
      <!-- 头部：时间与控制 -->
      <header class="flex justify-between items-center mb-8 border-b border-gray-700 pb-6">
        <div>
          <h1 class="text-3xl font-bold text-yellow-500">Open World RPG</h1>
          <div class="text-4xl mt-2 font-bold text-white">
            {{ gameStore.dateString }}
          </div>
          <div v-if="gameStore.worldState" class="text-gray-400 text-sm mt-1">
            Turn: {{ gameStore.worldState.turnCount }}
          </div>
        </div>

        <div class="flex gap-4 items-center">
          <button
              @click="gameStore.createTestActor"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm"
          >
            + 生成 NPC
          </button>

          <button
              @click="gameStore.nextTurn"
              :disabled="gameStore.isProcessing"
              class="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold text-xl transition shadow-lg flex items-center gap-2"
          >
            <span v-if="gameStore.isProcessing" class="animate-spin">↻</span>
            {{ gameStore.isProcessing ? '计算中...' : '下个月 ▶' }}
          </button>
        </div>
      </header>

      <!-- 内容区 -->
      <main>
        <h2 class="text-xl mb-4 text-gray-300">当前世界人口: <span class="text-green-400">{{ gameStore.actors.length }}</span></h2>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
              v-for="actor in gameStore.actors"
              :key="actor.id"
              class="bg-gray-800 p-4 rounded border border-gray-700 transition relative overflow-hidden"
          >
            <!-- 年龄增长时的高亮特效可以用 CSS 动画做，暂略 -->
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-lg">{{ actor.name }}</span>
              <span class="text-xs bg-gray-700 px-2 py-1 rounded">{{ actor.gender }}</span>
            </div>

            <div class="mb-2">
              <span class="text-2xl font-bold text-yellow-400">{{ actor.age }}</span>
              <span class="text-xs text-gray-500 ml-1">岁</span>
            </div>

            <div class="text-xs text-gray-400 bg-black/30 p-2 rounded">
              位置: {{ actor.locationId }}
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>