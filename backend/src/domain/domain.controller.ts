import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DomainService } from './domain.service';



@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('search')
  async search(@Query('domain') domain?: string, @Query('email') email?: string) {
	if (email) {
	  return this.domainService.getEmails(email);
	}else if (domain) {
    return this.domainService.getDomainInfo(domain);
	}else {
		throw new BadRequestException('Either domain or email must be provided');
	}
  }
}
