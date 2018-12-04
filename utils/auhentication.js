import jwt from 'jsonwebtoken'

const token = (Id) =>{
  return jwt.sign({_Id: Id}, 'thisisasecret', { expiresIn: '7 days'})
}
export { token }