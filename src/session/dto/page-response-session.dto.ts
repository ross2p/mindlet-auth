import type { PageResponse, SessionType } from '@ross2p/types';
import { SessionDto } from './session.dto';

export class PageResponseSessionDto implements PageResponse<SessionType> {
  data!: SessionDto[];

  totalCount!: number;

  pageNumber!: number;

  pageSize!: number;

  pageCount?: number;
}
