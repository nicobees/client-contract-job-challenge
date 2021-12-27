
const getProfile = (profileService) => {
    return async (req, res, next) => {
        const profile = await profileService.getProfileById(req.get('profile_id'))
        if(!profile) return res.status(401).end()
        req.profile = profile
        next()
    }
}
module.exports = {getProfile}