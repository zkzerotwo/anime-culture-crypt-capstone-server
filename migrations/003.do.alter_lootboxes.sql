ALTER TABLE lootboxes ADD COLUMN  box_owner
    INTEGER REFERENCES users(id)
    ON DELETE SET NULL;

