import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Handle user login (has sub and tableNumber)
    if (payload.sub && payload.tableNumber) {
      return { userId: payload.sub, tableNumber: payload.tableNumber, role: payload.role || 'user' };
    }

    // Handle admin/employee login (has userId, email, role)
    if (payload.userId && payload.email) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions || {},
      };
    }
    // Fallback
    return payload;
  }
}
