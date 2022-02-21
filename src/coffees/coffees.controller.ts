import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesServices: CoffeesService) {}
  @Get()
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.coffeesServices.findAll(pagination);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coffeesServices.findOne(id);
  }
  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesServices.create(createCoffeeDto);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesServices.update(id, updateCoffeeDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesServices.remove(id);
  }
}
