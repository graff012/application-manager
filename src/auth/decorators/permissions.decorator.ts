import { SetMetadata } from '@nestjs/common';
import { PermissionRequirement } from '../guards/permission.guard';

export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

export const RequirePermission = (
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete',
) => SetMetadata('permissions', { resource, action } as PermissionRequirement);
