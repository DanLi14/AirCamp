//Allows us to wrap the async function to catch errors w/o having to constantly write try/catch.

module.exports = fn => {
    return (req, res, next) => {
        fn(req,res,next).catch(next)
    }
}

