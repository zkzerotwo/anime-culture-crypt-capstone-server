const DropService = {
    //relevant
    getDrops(db) {
        return db
            .select('*')
            .from('drops')
    },
    getDropById(db, drop_id) {
        return db
            .select('*')
            .from('drops')
            .where('drops.id', drop_id)
            .first()
    },
    //relevant
    insertDrop(db, newDrop) {
        return db
            .insert(newDrop)
            .into('drops')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    //relevant
    updateDrop(db, drop_id, newDrop) {
        return db('drops')
            .update(newDrop, returning = true)
            .where({
                id: drop_id
            })
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    //relevant
    deleteDrop(db, drop_id) {
        return db('drops')
            .delete()
            .where({
                'id': drop_id
            })
    }
}

module.exports = DropService