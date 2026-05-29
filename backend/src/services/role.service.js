import Role from '../models/role.model.js'
import UserRoleMapper from '../models/user-role-mapper.model.js'

const ROLES = ['USER', 'RESOLVER', 'ADMIN']
const ROLE_PRIORITY = ['ADMIN', 'RESOLVER', 'USER']

export function normalizeRoleName(value) {
  const role = typeof value === 'string' ? value.trim().toUpperCase() : ''

  return ROLES.includes(role) ? role : null
}

export async function ensureRole(roleName) {
  const normalizedRole = normalizeRoleName(roleName)

  if (!normalizedRole) {
    return null
  }

  return Role.findOneAndUpdate(
    { name: normalizedRole.toLowerCase() },
    { $setOnInsert: { name: normalizedRole.toLowerCase() } },
    { new: true, upsert: true, runValidators: true },
  )
}

export async function getMappedRoles(userId) {
  const mappings = await UserRoleMapper.find({ user_id: userId }).lean()

  if (!mappings.length) {
    return []
  }

  const roleIds = mappings.map((mapping) => mapping.role_id)
  const roles = await Role.find({ role_id: { $in: roleIds } }).lean()

  return roles
    .map((role) => normalizeRoleName(role.name))
    .filter(Boolean)
}

export async function getUserRoles(user) {
  const mappedRoles = await getMappedRoles(user.user_id)
  const fallbackRole = normalizeRoleName(user.role)

  return mappedRoles.length ? mappedRoles : fallbackRole ? [fallbackRole] : []
}

export function getPrimaryRole(roles) {
  return ROLE_PRIORITY.find((role) => roles.includes(role)) || 'USER'
}
