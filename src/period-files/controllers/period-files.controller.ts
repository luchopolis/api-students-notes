import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PeriodFilesService } from '../services/period-files.service.js';
import { GeneratePeriodFileDto } from '../application/dtos/generate-period-file.dto.js';
import { FindPeriodFilesQueryDto } from '../application/dtos/find-period-files-query.dto.js';

@Controller('period-files')
export class PeriodFilesController {
  constructor(private readonly periodFilesService: PeriodFilesService) {}

  @Post()
  generate(@Body() data: GeneratePeriodFileDto) {
    return this.periodFilesService.generate(data);
  }

  @Get()
  findAll(@Query() query: FindPeriodFilesQueryDto) {
    return this.periodFilesService.findAll(query);
  }

  @Get(':id/download')
  getDownloadUrl(@Param('id') id: string) {
    return this.periodFilesService.getDownloadUrl(id);
  }
}
