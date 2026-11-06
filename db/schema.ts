import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const leads=sqliteTable('leads',{id:text('id').primaryKey(),name:text('name').notNull(),phone:text('phone').notNull(),location:text('location').notNull(),project:text('project').notNull(),timing:text('timing').notNull(),photo:text('photo').notNull(),createdAt:text('created_at').notNull()});
