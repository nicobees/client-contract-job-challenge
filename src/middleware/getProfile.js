
const getProfile = (profileRepository) => {
    return async (req, res, next) => {
        const profile = await profileRepository.getProfileById(req.get('profile_id'))
        if(!profile) return res.status(401).end()
        req.profile = profile
        next()
    }
}
module.exports = {getProfile}