import type {RxJsonSchema} from "rxdb";
import type {ActorDocType} from "../types/actor.ts";

export const actorSchema: RxJsonSchema<ActorDocType> = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string',
        },
        age: {
            type: 'number',
        },
        gender: {
            type: 'string',
            enum: ['male', 'female'],
        },
        stats: {
            type: 'object',
            properties: {
                strength: {
                    type: 'number',
                },
                intelligence: {
                    type: 'number',
                },
                charm: {
                    type: 'number',
                },
            },
        },
        locationId: {
            type: 'string',
        },
        createdAt: {
            type: 'number',
        },
    },
    required: ['id', 'name', 'age', 'stats', 'createdAt']
};