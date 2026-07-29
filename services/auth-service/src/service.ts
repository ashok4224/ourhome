/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Auth business logic: the only place in this service allowed to touch
 * `prisma.user`.
 */

import bcrypt from 'bcryptjs';
import { prisma } from '@ourhome/shared';

export interface AuthUserDTO {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'builder' | 'admin';
  avatar: string;
}

function toAuthUserDTO(user: { id: string; email: string; name: string; role: string; avatar: string }): AuthUserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as AuthUserDTO['role'],
    avatar: user.avatar,
  };
}

export async function verifyLogin(email: string, password: string): Promise<AuthUserDTO | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return toAuthUserDTO(user);
}

export async function getUserById(id: string): Promise<AuthUserDTO | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toAuthUserDTO(user) : null;
}
