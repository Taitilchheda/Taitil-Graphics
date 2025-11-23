export type MockUser = {
  id: string
  email: string
  password: string
  name: string
  role?: 'customer' | 'admin'
}

const users: MockUser[] = [
  {
    id: '1',
    email: 'customer@example.com',
    password: 'password123',
    name: 'John Customer',
    role: 'customer'
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  }
]

export const findUserByEmail = (email: string) => users.find(user => user.email === email)

export const addUser = (user: Omit<MockUser, 'id'> & { id?: string }) => {
  const existing = findUserByEmail(user.email)
  if (existing) return null

  const newUser: MockUser = {
    id: user.id || (users.length + 1).toString(),
    ...user,
    role: user.role || 'customer'
  }

  users.push(newUser)
  return newUser
}

export const validateCredentials = (email: string, password: string) => {
  const user = findUserByEmail(email)
  if (!user || user.password !== password) return null

  const { password: _password, ...userWithoutPassword } = user
  return userWithoutPassword
}
