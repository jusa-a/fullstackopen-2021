const dummy = (blogs) => {
    return blogs ? 1 : 0
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }
    return blogs.reduce(reducer, 0)
}

module.exports = {
    dummy,
    totalLikes,
}
