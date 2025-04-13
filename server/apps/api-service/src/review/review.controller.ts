import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common'
import { ReviewService } from './review.service'
import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { Roles } from 'apps/api-service/src/auth/passport/role.decorator'
import { Role } from 'apps/api-service/src/auth/role.enum'
import { JwtAuthGuard } from 'apps/api-service/src/auth/passport/jwt-auth.guard'
import { RolesGuard } from 'apps/api-service/src/auth/passport/role.guard'

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/create')
  create(@Request() { user }, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(user, createReviewDto)
  }

  @Get('doctor/:id')
  findByDoctor(@Param('id') id: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.reviewService.findByDoctor(id, page, limit)
  }

  @Get('/appointment/:id')
  findByAppointment(@Param('id') id: string, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.reviewService.findByAppointment(id, page, limit)
  }

  @Roles(Role.Doctor, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/respond')
  respondToReview(@Request() { user }, @Body() body: { reviewId: string; response: string }) {
    return this.reviewService.respondToReview(user, body.reviewId, body.response)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/all')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isVisible') isVisible?: boolean
  ) {
    return this.reviewService.findAll(page, limit, isVisible)
  }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/my-reviews')
  findMyReviews(@Request() { user }, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.reviewService.findByPatient(user._id, page, limit)
  }

  @Roles(Role.User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/update')
  update(@Request() { user }, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(user, updateReviewDto)
  }

  @Roles(Role.User, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/delete/:id')
  remove(@Request() { user }, @Param('id') id: string) {
    return this.reviewService.remove(user, id)
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('/:id/visibility')
  toggleVisibility(@Param('id') id: string, @Body() body: { isVisible: boolean }) {
    return this.reviewService.toggleVisibility(id, body.isVisible)
  }

  @Roles(Role.Doctor, Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/analytics/:id')
  getAnalytics(@Request() { user }, @Param('id') id: string) {
    return this.reviewService.getReviewAnalytics(user, id)
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id)
  }
}
