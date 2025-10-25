import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const prisma = new PrismaClient();

// Cliente JWKS para verificar tokens de Auth0
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err, null);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

interface Auth0TokenPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export class Auth0Service {
  /**
   * Obtiene información del usuario desde Auth0 usando el access token
   */
  static async getUserInfo(accessToken: string): Promise<Auth0TokenPayload> {
    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info from Auth0');
    }

    return response.json();
  }

  /**
   * Procesa el login con Auth0: obtiene info del usuario y crea/actualiza usuario
   */
  static async processAuth0Login(accessToken: string) {
    // Obtener información del usuario desde Auth0
    const tokenPayload = await this.getUserInfo(accessToken);

    if (!tokenPayload.email_verified) {
      throw new Error('Email no verificado');
    }

    // Buscar usuario por auth0Id o email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { auth0Id: tokenPayload.sub },
          { email: tokenPayload.email },
        ],
      },
    });

    if (user) {
      // Usuario existe - actualizar auth0Id si es necesario
      if (!user.auth0Id) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            auth0Id: tokenPayload.sub,
            authProvider: 'auth0',
            avatarUrl: tokenPayload.picture || user.avatarUrl,
          },
        });
      }
    } else {
      // Usuario no existe - crear nuevo
      user = await prisma.user.create({
        data: {
          email: tokenPayload.email,
          displayName: tokenPayload.name || tokenPayload.email.split('@')[0],
          auth0Id: tokenPayload.sub,
          authProvider: 'auth0',
          avatarUrl: tokenPayload.picture,
          passwordHash: null, // No tiene password porque usa Auth0
        },
      });

      // Asignar rol por defecto 'user'
      const userRole = await prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (userRole) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: userRole.id,
          },
        });
      }

      // Crear configuración por defecto
      await prisma.userSettings.create({
        data: {
          userId: user.id,
        },
      });
    }

    return user;
  }
}
