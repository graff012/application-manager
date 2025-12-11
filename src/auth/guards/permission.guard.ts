import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export interface PermissionRequirement {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) return true;

    const requiredPermission = this.reflector.get<PermissionRequirement>(
      'permission',
      context.getHandler(),
    );

    console.log('requiredPermission: ', requiredPermission);

    if (!requiredPermission)
      throw new ForbiddenException('Reqiered permission is null or undefined');

    if (!requiredPermission && !isPublic) {
      throw new ForbiddenException(
        'Endpoint must have permission or be marked public',
      );
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('user: ', user);

    if (!user) throw new ForbiddenException('User not authenticated');

    if (user.role === 'admin') {
      return true;
    }

    // check employee permission
    const { resource, action } = requiredPermission;
    const hasPermission = user.permissions?.[resource]?.[action] === true;

    if (!hasPermission) {
      throw new ForbiddenException(
        `You don't have permission to ${action} ${resource} `,
      );
    }

    // const hasPermission = requiredPermissions.some((permission) =>
    //   user.position.permissions.includes(permission),
    // );

    return true;
  }
}
