import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { AuditLogsRepository } from './audit-logs.repository';

@Injectable()
export class AuditLogsService {
  constructor(private readonly repository: AuditLogsRepository) {}

  findAll(query: AuditLogQueryDto) {
    return this.repository.findMany(query);
  }

  async findOne(id: string) {
    const log = await this.repository.findById(id);
    if (!log) throw new NotFoundException('Log de auditoria no encontrado');
    return log;
  }
}
