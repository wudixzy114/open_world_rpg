import { createDbInstance, type GameDatabase } from '../db';
import type { ActorDocType } from '../types/actor';

let db: GameDatabase | null = null;

const initDB = async ()=>{
    if(!db){
        db = await createDbInstance();
        console.log('🤖 Worker: Database connected');
    }
}

const processNextTurn = async () => {
    if(!db) await initDB();
    if(!db) return;
    console.time('SimulationTime');

    const worldDoc = await db.world.findOne('world_main').exec();
    if(!worldDoc) return;

    let {year , month ,turnCount} = worldDoc.toJSON();
    month++;
    if(month > 12){
        month = 1;
        year++;
    }
    turnCount++;

    const allActors = await db.actors.find().exec();
    const actorsToUpdate: ActorDocType[] = [];

    for(const actorDoc of allActors){
        const actor: ActorDocType = {...actorDoc.toJSON()};
        if (month === 1) {
            actor.age += 1;
            actorsToUpdate.push(actor);
        }
        if (Math.random() < 0.1) {
            // 假设 locationId 简单变一下，实际会查地图路径
            actor.locationId = Math.random() > 0.5 ? 'loc_luoyang' : 'loc_changan';
            // 避免重复 push，实际项目中需要更严谨的 dirty check
            if (!actorsToUpdate.find(a => a.id === actor.id)) {
                actorsToUpdate.push(actor);
            }
        }
    }

    if (actorsToUpdate.length > 0) {
        await db.actors.bulkUpsert(actorsToUpdate);
    }

    await worldDoc.patch({
        year,
        month,
        turnCount
    });
    console.timeEnd('SimulationTime');

    self.postMessage({
        type: 'TURN_COMPLETED',
        payload: { year, month, updatedCount: actorsToUpdate.length }
    });
}

self.onmessage = async (e) => {
    const { type } = e.data;

    switch (type) {
        case 'INIT':
            await initDB();
            self.postMessage({ type: 'READY' });
            break;

        case 'NEXT_TURN':
            await processNextTurn();
            break;
    }
}
