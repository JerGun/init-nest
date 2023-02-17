/* eslint-disable @typescript-eslint/ban-types */
import { Order } from '@/constants'
import { GeoShapeType } from '@/constants/geo'
import { Base } from '@/schemas/base.schema'
import * as admin from 'firebase-admin'

type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
  }[Keys]

type FirebaseUserRequest = Request & { user?: admin.auth.DecodedIdToken }

type ExtractModel<T> = Omit<T, keyof Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>
export interface IGeoLocation {
  lat: number
  lon: number
}
export interface IItem {
  key: number | string
  value: string
}

export interface DisplayIItem {
  label: NftProperty
  key: number | string
  value: string
}

export interface IEditable {
  editable: boolean
}

export type PaginationParams<M extends Base = any> = {
  page: number
  limit: number
  order?: Order
  sort?: keyof M
} & {
  [K in string]: any
}

export type PaginatedResult<T = any> = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  items: T[]
}

export interface IGeoShape {
  type?: GeoShapeType
  coordinates: number[] | number[][] | number[][][] | number[][][][]
}

export interface IWalletStore {
  address: string
  privateKey: string
}

export type FilteredKeys<T, U> = { [P in keyof T]: T[P] extends U ? P : never }[keyof T]

export type PropertyOf<T> = Pick<T, Exclude<keyof T, FilteredKeys<T, Function>>>
