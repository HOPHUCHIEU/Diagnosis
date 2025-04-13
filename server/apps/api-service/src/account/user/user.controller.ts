import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common'
import { UserService } from './user.service'
import { Roles } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'
import { AdminCreateUserDto } from 'apps/api-service/src/account/user/dto/admin-create-user.dto'
import { UpdateUserDto } from 'apps/api-service/src/account/user/dto/update-user.dto'
import { UpdateProfileDto } from 'apps/api-service/src/account/user/dto/update-profile.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all')
  getAllUsers(@Request() { user }) {
    return this.userService.findAll(user)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/find/:id')
  getUserById(@Param('id') id: string) {
    return this.userService.findOne(id)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  createUser(@Body() createUserDto: AdminCreateUserDto) {
    return this.userService.create(createUserDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update')
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete')
  deleteUser(@Body() body: { id: string }) {
    return this.userService.delete(body.id)
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/profile')
  getProfile(@Request() { user }) {
    return this.userService.getProfile(user)
  }

  @Roles(Role.Admin, Role.Doctor, Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update-profile')
  updateProfile(@Request() { user }, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(user, updateProfileDto)
  }
}
