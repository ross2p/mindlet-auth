import { ApiProperty } from '@nestjs/swagger';
import type { PageRequest } from '@ross2p/types';

export class PageRequestQueryDto implements PageRequest {
  @ApiProperty({
    description: 'The page number to retrieve',
    example: 1,
    required: false,
  })
  pageNumber = 1;

  @ApiProperty({
    description: 'The number of items per page',
    example: 200,
    required: false,
  })
  pageSize = 200;
}
