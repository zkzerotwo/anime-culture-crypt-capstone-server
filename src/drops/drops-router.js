const path = require('path')
const express = require('express')
const xss = require('xss')
const DropsService = require('./drops-service')

const dropsRouter = express.Router()
const jsonParser = express.json()

//filter out the response to avoid showing broken data
const serializeDrops = drop => ({
    id: drop.id,
    series: xss(drop.series_id),
    description: xss(drop.drop_description),
    lootbox: drop.lootbox_id

    // completed: drop.completed
})

dropsRouter
    .route('/')
    //relevant
    .get((req, res, next) => {

        //connect to the service to get the data
        DropsService.getDrops(req.app.get('db'))
            .then(drops => {
                //map the results to get each one of the objects and serialize them
                res.json(drops.map(serializeDrops))
            })
            .catch(next)
    })
    
    //relevant
    .post(jsonParser, (req, res, next) => {

        //take the input from the user
        const {
            series_id, drop_description, lootbox_id
        } = req.body
        const newDrop = {
            series_id, drop_description, lootbox_id
        }

        //validate the input
        for (const [key, value] of Object.entries(newDrop)) {
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
        DropsService.insertDrop(
            req.app.get('db'),
            newDrop
        )
            .then(drop => {
                res
                    //display the 201 status code
                    .status(201)
                    //redirect the request to the original url adding the drop id for editing
                    .location(path.posix.join(req.originalUrl, `/${drop.id}`))
                    //return the serialized results
                    .json(serializeDrops(drop))
            })
            .catch(next)
    })


dropsRouter
    .route('/:drop_id')
    .all((req, res, next) => {
        if (isNaN(parseInt(req.params.drop_id))) {
            //if there is an error show it
            return res.status(404).json({
                error: {
                    message: `Invalid id`
                }
            })
        }

        //connect to the service to get the data
        DropsService.getDropById(
            req.app.get('db'),
            req.params.drop_id
        )
            .then(drop => {
                if (!drop) {
                    //if there is an error show it
                    return res.status(404).json({
                        error: {
                            message: `Drop doesn't exist`
                        }
                    })
                }
                res.drop = drop
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {

        //get each one of the objects from the results and serialize them
        res.json(serializeDrops(res.drop))
    })
    //relevant
    .patch(jsonParser, (req, res, next) => {

        //take the input from the user
        const {
            id,
            series_id, 
            drop_description, 
            lootbox_id
        } = req.body
        const dropToUpdate = {
            id,
            series_id, 
            drop_description, 
            lootbox_id
        }

        //validate the input by checking the length of the dropToUpdate object to make sure that we have all the values
        const numberOfValues = Object.values(dropToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            //if there is an error show it
            return res.status(400).json({
                error: {
                    message: `Request body must content either 'title' or 'completed'`
                }
            })
        }

        //save the input in the db
        DropsService.updateDrop(
            req.app.get('db'),
            req.params.drop_id,
            dropToUpdate
        )
            .then(updatedDrop => {

                //get each one of the objects from the results and serialize them
                res.status(200).json(serializeDrops(updatedDrop))
            })
            .catch(next)
    })
    //relevant
    .delete((req, res, next) => {
        DropsService.deleteDrop(
            req.app.get('db'),
            req.params.drop_id
        )
            .then(numRowsAffected => {

                //check how many rows are effected to figure out if the delete was successful
                res.status(204).json(numRowsAffected).end()
            })
            .catch(next)
    })


module.exports = dropsRouter