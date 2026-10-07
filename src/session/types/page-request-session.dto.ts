import type { PageResponse, SessionType } from '@ross2p/types';

export class PageRequestSessionDto {
  userId!: string;

  pageNumber = 1;

  pageSize = 200;

  get skip(): number {
    return this.pageNumber * this.pageSize - this.pageSize;
  }

  get take(): number {
    return this.pageSize;
  }

  toPageResponse(
    data: SessionType[],
    totalCount: number,
  ): PageResponse<SessionType> {
    const pageSize = Math.min(data.length, this.pageSize);
    const denominator = Math.max(1, pageSize === 0 ? this.pageSize : pageSize);

    return {
      pageNumber: this.pageNumber,
      pageSize,
      pageCount: Math.ceil(totalCount / denominator),
      data,
      totalCount,
    };
  }
}
