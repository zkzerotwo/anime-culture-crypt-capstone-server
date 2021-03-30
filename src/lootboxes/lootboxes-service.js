const LootboxesService = {
    //relevant
    getLootboxes(db) {
        return db
            .select('*')
            .from('lootboxes')
    },
    getLootboxById(db, lootboxes_id) {
        return db
            .select('*')
            .from('lootboxes')
            .where('lootboxes.id', lootboxes_id)
            .first()
    },
    getDropsForLootbox(db, lootbox_id) {
        // console.log(lootbox_id)
        return db
        // .join('lootboxes', 'lootboxes.id', '=','drops.lootbox_id')
        .select('*')
        .from('drops')
        .where(lootbox_id, lootbox_id)
    },
    //relevant
    insertLootbox(db, newLootbox) {
        return db
            .insert(newLootbox)
            .into('lootboxes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    //relevant
    updateLootbox(db, lootboxes_id, newLootbox) {
        return db('lootboxes')
            .update(newLootbox, returning = true)
            .where({
                id: lootboxes_id
            })
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    //relevant
    deleteLootbox(db, lootboxes_id) {
        return db('lootboxes')
            .delete()
            .where({
                'id': lootboxes_id
            })
    }
}

module.exports = LootboxesService