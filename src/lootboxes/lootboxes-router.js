const path = require('path')
const express = require('express')
const xss = require('xss')
const LootboxService = require('./lootboxes-service')

const lootboxRouter = express.Router()
const jsonParser = express.json()

//filter out the response to avoid showing broken data
const serializeLootbox = lootbox => ({
    id: lootbox.id,
    title: xss(lootbox.title),
    description: xss(lootbox.description),
    box_owner: lootbox.box_owner,
    is_public: lootbox.is_public
    // completed: lootbox.completed
})

const serializeDrops = drop => ({
    id: drop.id,
    series: xss(drop.series_id),
    description: xss(drop.drop_description),
    lootbox: drop.lootbox_id

    // completed: drop.completed
})

lootboxRouter
    .route('/')
    //relevant
    .get((req, res, next) => {

        //connect to the service to get the data
        LootboxService.getLootboxes(req.app.get('db'))
            .then(lootboxes => {
                //map the results to get each one of the objects and serialize them
                res.json(lootboxes.map(serializeLootbox))
            })
            .catch(next)
    })
    //relevant
    .post(jsonParser, (req, res, next) => {

        //take the input from the user
        const {
            title,
            description,
            box_owner
        } = req.body
        const newLootbox = {
            title,
            description,
            box_owner
        }

        //validate the input
        for (const [key, value] of Object.entries(newLootbox)) {
            if (value == null) {
                //if there is an error show it
                return res.status(400).json({
                    error: {
                        message: `Missing '${key}' in request body`
                    }
                })
            }
        }

        //save the input in the db
        LootboxService.insertLootbox(
            req.app.get('db'),
            newLootbox
        )
            .then(lootbox => {
                res
                    //display the 201 status code
                    .status(201)
                    //redirect the request to the original url adding the lootbox id for editing
                    .location(path.posix.join(req.originalUrl, `/${lootbox.id}`))
                    //return the serialized results
                    .json(serializeLootbox(lootbox))
            })
            .catch(next)
    })


lootboxRouter
    .route('/:lootbox_id')
    .all((req, res, next) => {
        if (isNaN(parseInt(req.params.lootbox_id))) {
            //if there is an error show it
            return res.status(404).json({
                error: {
                    message: `Invalid id`
                }
            })
        }

        //connect to the service to get the data
        LootboxService.getLootboxById(
            req.app.get('db'),
            req.params.lootbox_id
        )
            .then(lootbox => {
                if (!lootbox) {
                    //if there is an error show it
                    return res.status(404).json({
                        error: {
                            message: `Lootbox doesn't exist`
                        }
                    })
                }
                res.lootbox = lootbox
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {

        //get each one of the objects from the results and serialize them
        res.json(serializeLootbox(res.lootbox))
    })
    //relevant
    .patch(jsonParser, (req, res, next) => {

        //take the input from the user
        const {
            id,
            title,
            description,
            box_owner
        } = req.body
        const lootboxToUpdate = {
            id,
            title,
            description,
            box_owner
        }

        //validate the input by checking the length of the lootboxToUpdate object to make sure that we have all the values
        const numberOfValues = Object.values(lootboxToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            //if there is an error show it
            return res.status(400).json({
                error: {
                    message: `Request body must content either 'title' or 'completed'`
                }
            })
        }

        //save the input in the db
        LootboxService.updateLootbox(
            req.app.get('db'),
            req.params.lootbox_id,
            lootboxToUpdate
        )
            .then(updatedLootbox => {

                //get each one of the objects from the results and serialize them
                res.status(200).json(serializeLootbox(updatedLootbox))
            })
            .catch(next)
    })
    //relevant
    .delete((req, res, next) => {
        LootboxService.deleteLootbox(
            req.app.get('db'),
            req.params.lootbox_id
        )
            .then(numRowsAffected => {

                //check how many rows are effected to figure out if the delete was successful
                res.status(204).json(numRowsAffected).end()
            })
            .catch(next)
    })
lootboxRouter.route('/:lootbox_id/saved')
.all((req, res, next) => {
    if (isNaN(parseInt(req.params.lootbox_id))) {
        //if there is an error show it
        return res.status(404).json({
            error: {
                message: `Invalid id`
            }
        })
    }

    //connect to the service to get the data
    LootboxService.getLootboxById(
        req.app.get('db'),
        req.params.lootbox_id
    )
        .then(lootbox => {
            if (!lootbox) {
                //if there is an error show it
                return res.status(404).json({
                    error: {
                        message: `Lootbox doesn't exist`
                    }
                })
            }
            res.lootbox = lootbox
            next()
        })
        .catch(next)
})
    //relevant
    .get((req, res, next) => {
        // console.log(req.params)
        LootboxService.getDropsForLootbox(req.app.get('db'),
        req.params)
            .then(drops => {
                //json each drop returned from the lootbox
                res.json({drops})
            })
            .catch(next)

    })
module.exports = lootboxRouter