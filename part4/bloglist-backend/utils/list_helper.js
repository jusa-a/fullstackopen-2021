const dummy = (blogs) => {
    return blogs ? 1 : 0
}

const totalLikes = (blogs) => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }
    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const reducer = (max, current) => {
        return max.likes > current.likes ? max : current
    }
    const favorite = blogs.reduce(reducer)
    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes,
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
}
