const express = require("express")
const path = require("path")
const uniqid = require("uniqid")
const { readDB, writeDB } = require("../lib/utilities")

const { check, validationResult } = require("express-validator")

const router = express.Router()
const projectsFilePath = path.join(__dirname, "projects.json")
const reviewsFilePath = path.join(__dirname, "reviews.json")

router.get("/:id", async (req, res, next) => {
  try {
    const projectsDB = await readDB(projectsFilePath)
    const project = projectsDB.filter(project => project.ID === req.params.id)
    if (project.length > 0) {
      res.send(project)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    next(error)
  }
})

router.get("/", async (req, res, next) => {
  try {
    const projectsDB = await readDB(projectsFilePath)
    if (req.query && req.query.name) {
      const filteredProjects = projectsDB.filter(
        project =>
          project.hasOwnProperty("name") &&
          project.name.toLowerCase() === req.query.name.toLowerCase()
      )
      res.send(filteredProjects)
    } else {
      res.send(projectsDB)
    }
  } catch (error) {
    next(error)
  }
})

router.post(
  "/",
  [
    check("name")
      .exists()
      .withMessage("Insert a name please!"),
    check("description")
      .exists()
      .withMessage("Provide a description please!"),
    check('repoURL')
      .exists()
      .withMessage('Provide the URL of the project')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const usersDB = await readDB(projectsFilePath)
        const newUser = {
          ...req.body,
          ID: uniqid(),
          modifiedAt: new Date(),
        }

        usersDB.push(newUser)

        await writeDB(projectsFilePath, usersDB)

        res.status(201).send({ id: newUser.ID })
      }
    } catch (error) {
      next(error)
    }
  }
)

router.delete("/:id", async (req, res, next) => {
  try {
    const usersDB = await readDB(projectsFilePath)
    const newDb = usersDB.filter(user => user.ID !== req.params.id)
    await writeDB(projectsFilePath, newDB)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

router.put("/:id", async (req, res, next) => {
  try {
    const usersDB = await readDB(projectsFilePath)
    const newDb = usersDB.filter(user => user.ID !== req.params.id)

    const modifiedUser = {
      ...req.body,
      ID: req.params.id,
      modifiedAt: new Date(),
    }

    newDb.push(modifiedUser)
    await writeDB(projectsFilePath, newDB)

    res.send({ id: modifiedUser.ID })
  } catch (error) {
    next(error)
  }
})

// GET /projects/id/reviews => get all the reviews for a given project
router.get("/:projectID/reviews", async (req, res, next) => {
  try {
    const reviews = await readDB(reviewsFilePath)
    const filteredReviews = reviews.filter(
      (review) => review.projectID === req.params.projectID
    );

    res.send(filteredReviews);
  } catch (err) {
    next(err);
  }
});

// POST /projects/id/reviews => add a new review for the given project
router.post("/:projectID/reviews", async (req, res, next) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const reviewsDB = await readDB(reviewsFilePath)
        const newReview = {
          ...req.body,
          ID: uniqid(),
          addedAt: new Date(),
        }

        reviewsDB.push(newReview)

        await writeDB(reviewsFilePath, reviewsDB)

        res.status(201).send({ ...req.body })
      }
    } catch (error) {
      next(error)
    }
  }
)


module.exports = router
