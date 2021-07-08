import { Controller, Post, Body, BadRequestException } from '@nestjs/common';

import { UsersService } from './users.service';
import { UpdateMessageDto } from './dto/updateMessageDto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('update')
  async updateMessage(@Body() updateMessageDto: UpdateMessageDto) {
    try {
      return await this.usersService.updateListBtns(updateMessageDto.list);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
