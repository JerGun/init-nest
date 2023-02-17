import { Order } from '@/constants'
import { PaginatedResult, PaginationParams } from '@/types'
import { Expose, plainToClass, Transform } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString
} from 'class-validator'

export class BaseDto {
  constructor(data?: BaseDto) {
    Object.assign(this, data)
  }

  @Expose()
  @IsInt()
  id?: number

  @Expose()
  @IsDate()
  updatedAt?: Date

  @Expose()
  @IsDate()
  createdAt?: Date

  @Expose()
  @IsBoolean()
  isActive?: boolean
}

export class PaginationParamsDto implements Partial<PaginationParams> {
  @IsNumberString()
  @IsOptional()
  page!: number

  @IsNumberString()
  @IsOptional()
  limit!: number

  @IsString()
  @IsOptional()
  sort?: string

  @IsEnum(Order)
  @IsOptional()
  @Transform((property) => property.value.toUpperCase())
  order?: Order
}

export class PaginatedResultDto<T> implements PaginatedResult<T> {
  constructor(data?: PaginatedResultDto<T>) {
    Object.assign(this, data)
  }

  @Expose()
  @IsNumber()
  page!: number

  @Expose()
  @IsNumber()
  limit!: number

  @Expose()
  @IsNumber()
  totalItems!: number

  @Expose()
  @IsNumber()
  totalPages!: number

  @Expose()
  @IsArray()
  items!: T[]

  async toPage?(plain: any) {
    return {
      ...this,
      items: this.items.map((res) => plainToClass(plain, res)),
    }
  }
}
