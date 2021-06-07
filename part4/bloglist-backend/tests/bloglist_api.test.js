const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('unique identifier property of blog post is named id', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body[0].id).toBeDefined()
    })

    describe('addition of a new blog', () => {
        test('succeeds with valid data', async () => {
            const newBlog = {
                title: 'Test Blog',
                author: 'Tester',
                url: 'https://notrealurl.com',
                likes: 1,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

            const titles = blogsAtEnd.map((b) => b.title)
            expect(titles).toContain('Test Blog')
        })

        test('with missing likes property defaults to 0', async () => {
            const newBlog = {
                title: 'Bad Blog',
                author: 'Tester',
                url: 'https://notrealurl.com',
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

            expect(blogsAtEnd[helper.initialBlogs.length].title).toEqual(
                'Bad Blog'
            )
            expect(blogsAtEnd[helper.initialBlogs.length].likes).toEqual(0)
        })

        test('fails with status code 400 if data invalid', async () => {
            const newBlog = {
                author: 'Tester',
                likes: 3,
            }

            await api.post('/api/blogs').send(newBlog).expect(400)

            const blogsAtEnd = await helper.blogsInDb()

            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        })
    })

    describe('deletion of a blog', () => {
        test('succeeds with status code 204 if id is valid', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

            const titles = blogsAtEnd.map((r) => r.title)

            expect(titles).not.toContain(blogToDelete.content)
        })
    })

    describe('updating of a blog', () => {
        test('succeeds with valid data', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const blog = {
                likes: 99,
            }

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(blog)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd[0].likes).toEqual(99)
        })
    })
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map((u) => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
})
