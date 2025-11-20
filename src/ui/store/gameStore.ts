import { defineStore } from 'pinia';
import {computed, ref} from 'vue';
import { getDatabase } from '../../core/db';
import { v4 as uuidv4 } from 'uuid';
import type { ActorDocType } from '../../core/types/actor';
import type {WorldStateDocType} from "../../core/types/world.ts";

import SimulationWorker from '../../core/simulation/worker?worker';

export const useGameStore = defineStore('game', () => {
    const actors = ref<ActorDocType[]>([]);
    const worldState = ref<WorldStateDocType | null>(null);

    const isReady = ref(false);
    const isProcessing = ref(false);

    let worker: Worker | null = null;

    const init = async () => {
        const db = await getDatabase();

        db.actors.find().$.subscribe((docs)=>{
            actors.value = docs.map(d => d.toJSON());
        });

        db.world.findOne('world_main').$.subscribe((doc) => {
            if (doc) worldState.value = doc.toJSON();
        });

        worker = new SimulationWorker();
        worker.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'READY') {
                console.log('✅ Main: Worker is ready');
                isReady.value = true;
            }
            if (type === 'TURN_COMPLETED') {
                console.log(`✅ Main: Turn completed. ${payload.updatedCount} actors updated.`);
                isProcessing.value = false;
            }
        };

        worker?.postMessage({ type: 'INIT' });
    }

    const nextTurn = () => {
        if (!worker || isProcessing.value) return;
        isProcessing.value = true;
        worker.postMessage({ type: 'NEXT_TURN' });
    };

    const createTestActor = async () => {
        const db = await getDatabase();
        const newActor: ActorDocType = {
            id: uuidv4(),
            name: `NPC-${Math.floor(Math.random() * 1000)}`,
            age: 16,
            gender: Math.random() > 0.5 ? 'male' : 'female',
            stats: {
                strength: Math.floor(Math.random() * 100),
                intelligence: Math.floor(Math.random() * 100),
                charm: Math.floor(Math.random() * 100),
            },
            locationId: 'loc_001', // 假设这里是新手村
            createdAt: Date.now()
        };

        await db.actors.insert(newActor);
    };

    const dateString = computed(() => {
        if (!worldState.value) return '加载中...';
        return `${worldState.value.year}年 ${worldState.value.month}月`;
    });

    const clearAll = async () => {
        const db = await getDatabase();
        await db.actors.find().remove();
    }

    return {
        isReady,
        isProcessing,
        actors,
        worldState,
        dateString,
        init,
        createTestActor,
        nextTurn,
        clearAll
    };
});
