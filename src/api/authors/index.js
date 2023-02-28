import Express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs"
import uniqid from "uniqid"


const authorsRouter = Express.Router()
const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "authors.json")

// 1. GET all authors
authorsRouter.get("/", (request, response) => {
    const authorsFile = fs.readFileSync(authorsJSONPath)
    response.send(JSON.parse(authorsFile))
})

// 2: POST new author
authorsRouter.post("/", async (request, response) => {
    try {
        const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
        let resFromMatch = await fetch('http://localhost:3000/authors/checkEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: request.body.email
            })
        })
        let matchOrNot = await resFromMatch.json()
        if (matchOrNot) {
            response.status(400).send("An author with this email already exists.")
        } else {
            const newAuthor = {
                ...request.body,
                ID: uniqid(),
                avatar: `https://ui-avatars.com/api/?name=${request.body.name}+${request.body.surname}`
            }
            authors.push(newAuthor)

            fs.writeFileSync(authorsJSONPath, JSON.stringify(authors))

            response.status(201).send({ id: newAuthor.ID })
        }

    } catch (error) {
        console.log(error)
    }


})

// EXTRA 1
authorsRouter.post("/checkEmail", (request, response) => {
    const authors = JSON.parse(fs.readFileSync(authorsJSONPath))

    const matchOrNot = authors.some(author => author.email === request.body.email)
    response.send(matchOrNot)
})

// 3. GET a specific author
authorsRouter.get("/:authorId", (request, response) => {
    const authors = JSON.parse(fs.readFileSync(authorsJSONPath))

    const author = authors.find(author => author.ID === request.params.authorId)

    response.send(author)

})

// 4. PUT a specific author
authorsRouter.put("/:authorId", (request, response) => {
    const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
    const index = authors.findIndex(author => author.ID === request.params.authorId)
    const authorToUpdate = authors[index]
    const updatedAuthor = { ...authorToUpdate, ...request.body }
    authors[index] = updatedAuthor

    fs.writeFileSync(authorsJSONPath, JSON.stringify(authors))

    response.send(updatedAuthor)
})

// 5. DELETE a specific author
authorsRouter.delete("/:authorId", (request, response) => {
    const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
    const newAuthors = authors.filter(author => author.ID !== request.params.authorId)

    fs.writeFileSync(authorsJSONPath, JSON.stringify(newAuthors))

    response.status(204).send()
})

export default authorsRouter
