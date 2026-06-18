// src/hooks/use-leads.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { leadsService } from '@/services/leads.service'
import type { LeadFilters, CreateLeadData, UpdateLeadData } from '@/types'
import toast from 'react-hot-toast'

export const LEADS_QUERY_KEY = 'leads'

export function useLeads(filters?: LeadFilters) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, filters],
    queryFn: () => leadsService.getAll(filters),
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [LEADS_QUERY_KEY, id],
    queryFn: () => leadsService.getById(id),
    enabled: !!id,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeadData) => leadsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] })
      toast.success('سرنخ با موفقیت ایجاد شد')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadData }) =>
      leadsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY, variables.id] })
      toast.success('سرنخ با موفقیت بروزرسانی شد')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => leadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] })
      toast.success('سرنخ با موفقیت حذف شد')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}