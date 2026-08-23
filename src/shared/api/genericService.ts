import type { AxiosRequestConfig } from 'axios'
import { api } from './axiosInstance'
import type { PageDto } from './types'

export class GenericService<T> {
  private readonly basePath: string

  constructor(basePath: string) {
    this.basePath = basePath
  }

  async getAll(params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<PageDto<T>> {
    const { data } = await api.get<PageDto<T>>(this.basePath, { params, ...config })
    return data
  }

  async getById(id: string | number, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await api.get<T>(`${this.basePath}/${id}`, config)
    return data
  }

  async create(body: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await api.post<T>(this.basePath, body, config)
    return data
  }

  async update(id: string | number, body: unknown, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await api.put<T>(`${this.basePath}/${id}`, body, config)
    return data
  }

  async delete(id: string | number, config?: AxiosRequestConfig): Promise<void> {
    await api.delete(`${this.basePath}/${id}`, config)
  }
}
