-- Each ticket reason counts its own tickets (Donations #1, #2 ...) next to the server-wide number.
ALTER TABLE "ticket_categories" ADD COLUMN "next_number" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "tickets" ADD COLUMN "category_number" INTEGER;
