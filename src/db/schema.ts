import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Dapurs (Kitchens) table
export const dapurs = sqliteTable('dapurs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  location: text('location').notNull(),
  capacity: integer('capacity').notNull(),
  managerName: text('manager_name').notNull(),
  contact: text('contact').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Daily Metrics table
export const dailyMetrics = sqliteTable('daily_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dapurId: integer('dapur_id').notNull().references(() => dapurs.id),
  date: text('date').notNull(),
  portionTarget: integer('portion_target').notNull(),
  portionActual: integer('portion_actual').notNull(),
  budgetPerPortion: integer('budget_per_portion').notNull(),
  actualCostPerPortion: integer('actual_cost_per_portion').notNull(),
  kitchenStatus: text('kitchen_status').notNull(),
  createdAt: text('created_at').notNull(),
});

// Menu Items table
export const menuItems = sqliteTable('menu_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dapurId: integer('dapur_id').notNull().references(() => dapurs.id),
  date: text('date').notNull(),
  session: text('session').notNull(),
  dishes: text('dishes', { mode: 'json' }).notNull(),
  createdAt: text('created_at').notNull(),
});

// Material Usage table
export const materialUsage = sqliteTable('material_usage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dapurId: integer('dapur_id').notNull().references(() => dapurs.id),
  date: text('date').notNull(),
  materialName: text('material_name').notNull(),
  unit: text('unit').notNull(),
  standardAmount: real('standard_amount').notNull(),
  actualAmount: real('actual_amount').notNull(),
  variance: real('variance').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
});

// Staff Attendance table
export const staffAttendance = sqliteTable('staff_attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dapurId: integer('dapur_id').notNull().references(() => dapurs.id),
  date: text('date').notNull(),
  totalStaff: integer('total_staff').notNull(),
  present: integer('present').notNull(),
  onLeave: integer('on_leave').notNull(),
  sick: integer('sick').notNull(),
  createdAt: text('created_at').notNull(),
});

// Feedback Entries table
export const feedbackEntries = sqliteTable('feedback_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dapurId: integer('dapur_id').notNull().references(() => dapurs.id),
  date: text('date').notNull(),
  session: text('session').notNull(),
  feedbackText: text('feedback_text').notNull(),
  sentiment: text('sentiment').notNull(),
  status: text('status').notNull().default('noted'),
  createdAt: text('created_at').notNull(),
});

// Sanitation Scores table
export const sanitationScores = sqliteTable('sanitation_scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dapurId: integer('dapur_id').notNull().references(() => dapurs.id),
  date: text('date').notNull(),
  kitchenCleanliness: integer('kitchen_cleanliness').notNull(),
  storage: integer('storage').notNull(),
  equipment: integer('equipment').notNull(),
  personalHygiene: integer('personal_hygiene').notNull(),
  pestControl: integer('pest_control').notNull(),
  documentation: integer('documentation').notNull(),
  createdAt: text('created_at').notNull(),
});

// Production History table
export const productionHistory = sqliteTable('production_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dapurId: integer('dapur_id').notNull().references(() => dapurs.id),
  date: text('date').notNull(),
  dayName: text('day_name').notNull(),
  target: integer('target').notNull(),
  actual: integer('actual').notNull(),
  createdAt: text('created_at').notNull(),
});