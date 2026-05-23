import { PageRequestQueryDto } from './page-request-query.dto';
import { PageResponseSessionDto } from './page-response-session.dto';
import { SessionDto } from './session.dto';

export class PageRequestSessionDto extends PageRequestQueryDto {
  userId!: string;

  get skip(): number {
    return this.pageNumber * this.pageSize - this.pageSize;
  }

  get take(): number {
    return this.pageSize;
  }

  toPageResponse(
    content: SessionDto[],
    totalCount: number,
  ): PageResponseSessionDto {
    const pageSize = Math.min(content.length, this.pageSize);
    const denominator = Math.max(1, pageSize === 0 ? this.pageSize : pageSize);

    return {
      pageNumber: this.pageNumber,
      pageSize,
      pageCount: Math.ceil(totalCount / denominator),
      content,
      totalCount,
    };
  }
}
