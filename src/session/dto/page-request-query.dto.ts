import type { PageRequest } from '@ross2p/types';

export class PageRequestQueryDto implements PageRequest {
  pageNumber = 1;

  pageSize = 200;
}
