import { plainToClass } from 'class-transformer'
import { PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn } from 'typeorm'
import { PaginatedResultDto } from '../dto/base.dto'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  @Column({ type: 'varchar', length: 300, unique: true, nullable: true })
  uniqueName: string

  public toPage(data: any) {
    return plainToClass(PaginatedResultDto, {
      items: data.items,
      ...data,
    })
  }
}

export type BaseDocument = BaseEntity
