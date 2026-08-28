import { ApiProperty } from '@nestjs/swagger';

export class ListSessionsMessageDto {
  @ApiProperty({ description: 'Owning user identifier', format: 'uuid' })
  userId!: string;

  @ApiProperty({ description: 'The page number to retrieve' })
  pageNumber = 1;

  @ApiProperty({ description: 'The number of items per page' })
  pageSize = 200;
}
