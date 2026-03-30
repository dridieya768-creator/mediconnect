import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
  Injectable, ExecutionContext, UnauthorizedException,
  SetMetadata, CanActivate,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../modules/users/entities/user.entity';
import { AdminService, CreateUserAdminDto, UpdateUserAdminDto } from './admin.service';

@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new UnauthorizedException();
    return requiredRoles.includes(user.role);
  }
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN_SYSTEM)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales utilisateurs' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiQuery({ name: 'role',   required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  getUsers(
    @Query('role')   role?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('search') search?: string,
    @Query('page')   page = 1,
    @Query('limit')  limit = 20,
  ) {
    return this.adminService.getUsers({ role, status, search, page: +page, limit: +limit });
  }

  @Get('users/:id')
  getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users')
  createUser(@Body() dto: CreateUserAdminDto) {
    return this.adminService.createUser(dto);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/:id/reset-password')
  resetPassword(@Param('id') id: string) {
    return this.adminService.resetPassword(id);
  }

  // ✅ FIX : endpoint documents — retourne directement le tableau
  // Le frontend dans loadDoctorDocs() gère les deux formats (array direct ou { data: [] })
  @Get('users/:id/documents')
  @ApiOperation({ summary: 'Documents soumis par un médecin lors de son inscription' })
  async getDoctorDocuments(@Param('id') id: string) {
    const docs = await this.adminService.getDoctorDocuments(id);
    return docs; // tableau direct — loadDoctorDocs() dans le frontend gère les deux formats
  }
}