<script setup lang="ts">
import { onMounted } from 'vue';
import { useGameStore } from './ui/store/gameStore';

const gameStore = useGameStore();

onMounted(() => {
  gameStore.init();
});
</script>

<template>
  <div class="h-screen bg-gray-900 text-white p-8 font-mono">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold mb-4 text-yellow-500">Project: Open World RPG</h1>

      <!-- 控制区 -->
      <div class="flex gap-4 mb-8 border-b border-gray-700 pb-6">
        <button
            @click="gameStore.createTestActor"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded transition"
        >
          + 生成测试 NPC
        </button>

        <button
            @click="gameStore.clearAll"
            class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded transition"
        >
          清空数据库
        </button>
      </div>

      <!-- 状态区 -->
      <div v-if="!gameStore.isReady" class="text-gray-400">正在初始化世界数据库...</div>

      <div v-else>
        <h2 class="text-xl mb-4">当前世界人口: <span class="text-green-400">{{ gameStore.actors.length }}</span></h2>

        <!-- 列表渲染 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
              v-for="actor in gameStore.actors"
              :key="actor.id"
              class="bg-gray-800 p-4 rounded border border-gray-700 hover:border-blue-500 transition"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-lg">{{ actor.name }}</span>
              <span class="text-xs bg-gray-700 px-2 py-1 rounded">{{ actor.gender }} | {{ actor.age }}岁</span>
            </div>
            <div class="text-sm text-gray-400 space-y-1">
              <div class="flex justify-between"><span>武力</span> <span class="text-red-400">{{ actor.stats.strength }}</span></div>
              <div class="flex justify-between"><span>智力</span> <span class="text-blue-400">{{ actor.stats.intelligence }}</span></div>
              <div class="flex justify-between"><span>魅力</span> <span class="text-pink-400">{{ actor.stats.charm }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>