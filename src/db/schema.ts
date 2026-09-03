import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const estimates = pgTable('estimates', {
  id: text('id').primaryKey(), // e.g. E000001
  clientName: text('client_name').notNull(),
  location: text('location').notNull(),
  phone: text('phone'),
  workType: text('work_type'),
  grandTotal: integer('grand_total').default(0),
  dataJson: text('data_json'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const officeWorks = pgTable('office_works', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  client: text('client'),
  location: text('location'),
  category: text('category'),
  type: text('type').default('pdf'),
  isImportant: boolean('is_important').default(false),
  url: text('url'),
  createdAt: timestamp('created_at').defaultNow()
});

export const googleDocsSheets = pgTable('google_docs_sheets', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  docType: text('doc_type').notNull(), // 'doc' | 'sheet'
  googleId: text('google_id').notNull(),
  webUrl: text('web_url').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export const usersRelations = relations(users, ({ many }) => ({
}));
