CREATE TABLE `daily_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dapur_id` integer NOT NULL,
	`date` text NOT NULL,
	`portion_target` integer NOT NULL,
	`portion_actual` integer NOT NULL,
	`budget_per_portion` integer NOT NULL,
	`actual_cost_per_portion` integer NOT NULL,
	`kitchen_status` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`dapur_id`) REFERENCES `dapurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `dapurs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`capacity` integer NOT NULL,
	`manager_name` text NOT NULL,
	`contact` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feedback_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dapur_id` integer NOT NULL,
	`date` text NOT NULL,
	`session` text NOT NULL,
	`feedback_text` text NOT NULL,
	`sentiment` text NOT NULL,
	`status` text DEFAULT 'noted' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`dapur_id`) REFERENCES `dapurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `material_usage` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dapur_id` integer NOT NULL,
	`date` text NOT NULL,
	`material_name` text NOT NULL,
	`unit` text NOT NULL,
	`standard_amount` real NOT NULL,
	`actual_amount` real NOT NULL,
	`variance` real NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`dapur_id`) REFERENCES `dapurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dapur_id` integer NOT NULL,
	`date` text NOT NULL,
	`session` text NOT NULL,
	`dishes` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`dapur_id`) REFERENCES `dapurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `production_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dapur_id` integer NOT NULL,
	`date` text NOT NULL,
	`day_name` text NOT NULL,
	`target` integer NOT NULL,
	`actual` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`dapur_id`) REFERENCES `dapurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sanitation_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dapur_id` integer NOT NULL,
	`date` text NOT NULL,
	`kitchen_cleanliness` integer NOT NULL,
	`storage` integer NOT NULL,
	`equipment` integer NOT NULL,
	`personal_hygiene` integer NOT NULL,
	`pest_control` integer NOT NULL,
	`documentation` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`dapur_id`) REFERENCES `dapurs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `staff_attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dapur_id` integer NOT NULL,
	`date` text NOT NULL,
	`total_staff` integer NOT NULL,
	`present` integer NOT NULL,
	`on_leave` integer NOT NULL,
	`sick` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`dapur_id`) REFERENCES `dapurs`(`id`) ON UPDATE no action ON DELETE no action
);
