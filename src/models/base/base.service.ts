import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate'
import { ExtractModel, PropertyOf, RequireAtLeastOne } from 'src/types'
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Repository,
  SelectQueryBuilder,
  UpdateResult
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { PaginatedResultDto, PaginationParamsDto } from './dto/base.dto'
import { BaseDocument } from './entities/base.entity'

type ModelPropertyOf<T> = PropertyOf<T>

@Injectable()
export class BaseService<T extends BaseDocument> {
  constructor(@InjectRepository(Repository) private repo: Repository<T>) {}

  async save(data: DeepPartial<T>): Promise<T> {
    return await this.repo.save(data)
  }

  async create(data: DeepPartial<T>): Promise<T> {
    return await this.repo.save(data)
  }

  async findOneOrCreate(data: RequireAtLeastOne<T>, payload?: DeepPartial<T>): Promise<T> {
    const result = await this.repo.findOne(data as any)
    return result ? Promise.resolve(result) : this.repo.save({ ...payload, ...data })
  }

  async findAll(): Promise<T[]> {
    return await this.repo.find()
  }

  public async findOne(data: RequireAtLeastOne<ModelPropertyOf<T>>): Promise<T> {
    return this.repo.findOne(data as any).then((result: T) => {
      if (!result) throw new NotFoundException()
      return result
    })
  }

  public async find(data: RequireAtLeastOne<ModelPropertyOf<T>>): Promise<T[]> {
    return this.repo.find(data as any).then((result: T[]) => {
      if (!result) throw new NotFoundException()
      return result
    })
  }

  public async exists(data: RequireAtLeastOne<ModelPropertyOf<T>>): Promise<boolean> {
    return (await this.repo.createQueryBuilder().where(data).getCount()) !== 0
  }

  public async findByCondition(conditions: FindManyOptions<T>): Promise<T[]> {
    return await this.repo.find(conditions).then((result: T[]) => {
      if (!result) throw new NotFoundException()
      return result
    })
  }

  public async findOneByCondition(conditions: FindManyOptions<T>): Promise<T> {
    return await this.repo.findOne(conditions).then((result: T) => {
      if (!result) throw new NotFoundException()
      return result
    })
  }

  async getIds(condition?: any): Promise<number[]> {
    return await (
      await this.repo.find({
        where: condition,
        select: ['id'],
      })
    ).map((res) => res.id)
  }

  public async findByIds(ids: BaseDocument['id'][]): Promise<T[]> {
    return await this.repo.createQueryBuilder().where('id IN (:...ids)', { ids: ids }).getMany()
  }

  public async findCount(data: RequireAtLeastOne<ModelPropertyOf<T>>): Promise<number> {
    return await this.repo.createQueryBuilder().where(data).getCount()
  }

  async findOneById(id: BaseDocument['id']): Promise<T> {
    return await this.repo.findOne({ where: { id: id as any } }).then((result: T) => {
      if (!result) throw new NotFoundException()
      return result
    })
  }

  async updateOneById(id: BaseDocument['id'], data: QueryDeepPartialEntity<ExtractModel<T>>): Promise<T> {
    const result = await this.repo.findOne({ where: { id: id as any } })
    return await this.repo.update(id, data as any).then((res) => {
      if (!res) throw new NotFoundException()
      return { ...result, ...data }
    })
  }

  async updateOneByUniqueName(
    uniqueName: BaseDocument['uniqueName'],
    data: QueryDeepPartialEntity<ExtractModel<T>>,
  ): Promise<T> {
    const result = await this.repo.findOne({ where: { uniqueName: uniqueName as any } })
    return await this.repo.update(result.id, data as any).then((res) => {
      if (!res) throw new NotFoundException()
      return { ...result, ...data }
    })
  }

  async updateManyById(
    ids: BaseDocument['id'][],
    data: QueryDeepPartialEntity<ExtractModel<T>>,
  ): Promise<UpdateResult> {
    return await this.repo.update(ids, data as any).then((res) => {
      if (!res) throw new NotFoundException()
      return res
    })
  }

  async updateManyCondition(
    conditions: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<ExtractModel<T>>,
  ): Promise<UpdateResult> {
    return await this.repo.update(conditions, data as any).then((res) => {
      if (!res) throw new NotFoundException()
      return res
    })
  }

  async deleteOneById(id: BaseDocument['id']): Promise<any> {
    return await this.repo.delete({ id: id as any }).then((res) => {
      if (!res || res.affected == 0) throw new NotFoundException()
      return res
    })
  }

  async deleteOneByCondition(conditions: FindOptionsWhere<T>): Promise<any> {
    return await this.repo.delete(conditions).then((res) => {
      if (!res || res.affected == 0) throw new NotFoundException()
      return res
    })
  }

  async deleteByIds(ids: BaseDocument['id'][]): Promise<any> {
    if (ids.length == 0) return []
    return await this.repo.delete({ id: In(ids) as any }).then((res) => {
      if (!res || res.affected == 0) throw new NotFoundException()
      return res
    })
  }

  async getSimplePaginatedResult(
    conditions?: FindManyOptions<T>,
    options?: PaginationParamsDto,
  ): Promise<PaginatedResultDto<T>> {
    const limit = options.limit != null ? +(options.limit as number) : 10
    const page = options.page != null && options.page > 0 ? (options.page as number) - 1 : 0

    conditions['take'] = limit
    conditions['skip'] = page * limit
    const order = {}
    order[options.sort != null ? options.sort : 'createdAt'] =
      options.order != null ? options.order.toUpperCase() : 'DESC'

    const [result, total] = await this.repo.findAndCount({
      ...conditions,
      order: order,
    })
    return new PaginatedResultDto({
      page: page + 1,
      limit: conditions.take * 1,
      totalItems: total,
      totalPages:
        total % conditions.take == 0 ? total / conditions.take : Math.floor((total / conditions.take) as number) + 1,
      items: result,
    })
  }

  async getPaginatedResult(queryBuilder?: SelectQueryBuilder<T>, options?: IPaginationOptions): Promise<Pagination<T>> {
    return await paginate<T>(queryBuilder, options)
  }
}
