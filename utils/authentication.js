import jwt from 'jsonwebtoken'

const token = (Id) =>{
  return jwt.sign({id: Id}, 'thisisasecret', { expiresIn: '7 days'})
}
export { token }