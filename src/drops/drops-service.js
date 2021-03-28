const DropService = {
    //relevant
    getDrops(db) {
        return db
            .select('*')
            .from('drop')
    },
    getDropById(db, drop_id) {
        return db
            .select('*')
            .from('drop')
            .where('drop.id', drop_id)
            .first()
    },
    //relevant
    insertDrop(db, newDrop) {
        return db
            .insert(newDrop)
            .into('drop')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    //relevant
    updateDrop(db, drop_id, newDrop) {
        return db('drop')
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
        return db('drop')
            .delete()
            .where({
                'id': drop_id
            })
    }
}

module.exports = DropService