import { createRxDatabase, addRxPlugin, type RxDatabase, type RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { actorSchema, worldSchema} from './schemas';
import type { ActorDocType } from '../types/actor';
import {wrappedValidateAjvStorage} from "rxdb/plugins/validate-ajv";
import type {WorldStateDocType} from "../types/world.ts";

let pluginsAdded = false;
const addPlugins = async () => {
    if (pluginsAdded) return;
    if (import.meta.env.DEV) {
        await import('rxdb/plugins/dev-mode').then(({ RxDBDevModePlugin }) => {
            addRxPlugin(RxDBDevModePlugin);
        });
    }
    pluginsAdded = true;
};

export type GameDatabaseCollections = {
    actors: RxCollection<ActorDocType>;
    world: RxCollection<WorldStateDocType>;
}

export type GameDatabase = RxDatabase<GameDatabaseCollections>;

export const createDbInstance  = async (): Promise<GameDatabase> => {
    await addPlugins();

    const storage = import.meta.env.DEV ? wrappedValidateAjvStorage({storage: getRxStorageDexie()}) : getRxStorageDexie();
    const db = await createRxDatabase<GameDatabaseCollections>({
        name: 'open_world_rpg_db',
        storage: storage,
        multiInstance: true,
        ignoreDuplicate: true
    });

    await db.addCollections({
        actors: {
            schema: actorSchema,
        },
        world: {
            schema: worldSchema
        }
    });

    const worldDoc = await db.world.findOne('world_main').exec();
    if(!worldDoc){
        await db.world.insert({
            id: 'world_main',
            year: 184,
            month: 1,
            turnCount: 0
        });
    }

    return db;
}

let dbPromise: Promise<GameDatabase> | null = null;
export const getDatabase = () => {
    if(!dbPromise){
        dbPromise = createDbInstance();
    }
    return dbPromise;
}
