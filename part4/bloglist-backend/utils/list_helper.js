const dummy = (blogs) => {
    return blogs ? 1 : 0
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }
    return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return undefined

    const reducer = (max, curr) => {
        return max.likes > curr.likes ? max : curr
    }
    const favorite = blogs.reduce(reducer, {})
    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes,
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return undefined

    let authors = []
    blogs.reduce((res, curr) => {
        if (!res[curr.author]) {
            res[curr.author] = { author: curr.author, blogs: 0 }
            authors.push(res[curr.author])
        }
        res[curr.author].blogs += 1
        return res
    }, {})

    const author = authors.reduce((max, curr) => {
        return max.blogs > curr.blogs ? max : curr
    }, {})

    return {
        author: author.author,
        blogs: author.blogs,
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return undefined

    let authors = []
    blogs.reduce((res, curr) => {
        if (!res[curr.author]) {
            res[curr.author] = { author: curr.author, likes: 0 }
            authors.push(res[curr.author])
        }
        res[curr.author].likes += curr.likes
        return res
    }, {})

    const author = authors.reduce((max, curr) => {
        return max.likes > curr.likes ? max : curr
    }, {})

    return {
        author: author.author,
        likes: author.likes,
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}
