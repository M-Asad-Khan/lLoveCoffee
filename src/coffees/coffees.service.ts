import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Event } from './entities/event.entity';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Event.name) private readonly eventModule: Model<Event>,
  ) {}

  findAll(paginationDto: PaginationQueryDto) {
    const { limit, offset } = paginationDto;
    return this.coffeeModel.find().skip(offset).limit(limit).exec();
  }
  async findOne(id: string) {
    const coffee = await this.coffeeModel.findOne({ _id: id }).exec();
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found `);
    }
    return coffee;
  }
  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = new this.coffeeModel(createCoffeeDto);
    return coffee.save();
  }
  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = await this.coffeeModel
      .findOneAndUpdate({ _id: id }, { $set: updateCoffeeDto }, { new: true })
      .exec();
    if (!existingCoffee) {
      throw new NotFoundException(`Coffee #${id} not found `);
    }
    return existingCoffee;
  }
  async remove(id: string) {
    const coffee = await this.findOne(id);

    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found `);
    }
    return coffee.remove();
  }
  async recommendedCoffee(coffee: Coffee) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      coffee.recommendation++;
      const recommendEvent = new this.eventModule({
        name: 'recommend-coffee',
        type: 'coffee',
        payload: { coffeeId: coffee.id },
      });
      await recommendEvent.save({ session });
      await coffee.save({ session });
      session.commitTransaction();
    } catch {
      session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
}
