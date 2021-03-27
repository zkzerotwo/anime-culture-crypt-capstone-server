    ALTER TABLE drops ADD COLUMN  lootbox_id
    INTEGER REFERENCES lootboxes(id)
    ON DELETE SET NULL;