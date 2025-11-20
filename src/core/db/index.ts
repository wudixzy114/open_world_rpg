import { createRxDatabase, addRxPlugin, type RxDatabase, type RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { actorSchema } from './schemas';
import type { ActorDocType } from '../types/actor';
import {wrappedValidateAjvStorage} from "rxdb/plugins/validate-ajv";

if(import.meta.env.DEV){
    await import('rxdb/plugins/dev-mode').then(({RxDBDevModePlugin}) => addRxPlugin(RxDBDevModePlugin));
}

export type GameDatabaseCollections = {
    actors: RxCollection<ActorDocType>;
}

export type GameDatabase = RxDatabase<GameDatabaseCollections>;

let dbPromise: Promise<GameDatabase>;
const _create = async (): Promise<GameDatabase> => {
    console.log('Initializing Game Database...');
    const storage = import.meta.env.DEV ? wrappedValidateAjvStorage({storage: getRxStorageDexie()}) : getRxStorageDexie();

    const db = await createRxDatabase<GameDatabaseCollections>({
        name: 'open_world_rpg_db',
        storage: storage,
        ignoreDuplicate: true
    });

    await db.addCollections({
        actors: {
            schema: actorSchema,
        }
    });

    console.log('Database initialized!');
    return db;
}

export const getDatabase = () => {
    if(!dbPromise){
        dbPromise = _create();
    }
    return dbPromise;
}
