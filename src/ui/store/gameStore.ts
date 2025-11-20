import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getDatabase } from '../../core/db';
import { v4 as uuidv4 } from 'uuid';
import type { ActorDocType } from '../../core/types/actor';

export const useGameStore = defineStore('game', () => {
    const actors = ref<ActorDocType[]>([]);
    const isReady = ref(false);

    const init = async () => {
        const db = await getDatabase();
        db.actors.find().$.subscribe((docs)=>{
            actors.value = docs.map(d => d.toJSON());
        });

        isReady.value = true;
    }

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

    const clearAll = async () => {
        const db = await getDatabase();
        await db.actors.find().remove();
    }

    return {isReady, actors, init, createTestActor, clearAll};
});
