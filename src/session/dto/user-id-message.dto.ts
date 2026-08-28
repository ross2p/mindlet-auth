import { ApiProperty } from '@nestjs/swagger';

export class UserIdMessageDto {
  @ApiProperty({ description: 'User identifier', format: 'uuid' })
  userId!: string;
}
