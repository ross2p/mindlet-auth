import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PageResponse, SessionType } from '@ross2p/types';
import { SessionDto } from './session.dto';

export class PageResponseSessionDto implements PageResponse<SessionType> {
  @ApiProperty({ type: [SessionDto] })
  data!: SessionDto[];

  @ApiProperty()
  totalCount!: number;

  @ApiProperty()
  pageNumber!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiPropertyOptional()
  pageCount?: number;
}
