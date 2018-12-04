import jwt from 'jsonwebtoken'

const getUserId = (req, requireAuth = true) => {
  const header = req.headers.authorization

  if(header) {
    const token = header.replace('Bearer ', '')
    try {
      const decoded = jwt.verify(token, 'thisisasecret')
      console.log(decoded)
      return decoded.id
    } catch(err) {
      throw new Error('invalid token')
    }
  
  }
  if (requireAuth) {
    throw new Error('Authentication required')
  }
 
  return null

}
export default getUserId
