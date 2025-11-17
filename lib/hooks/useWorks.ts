import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Work } from '@/lib/work-store'
import { z } from 'zod'
import { workSchema } from '@/lib/validations/work'

type WorkInput = z.input<typeof workSchema>

// 1) 모든 작업물 조회
export function useWorks(category?: string) {
  return useQuery<Work[], Error>({
    queryKey: category ? ['works', category] : ['works'],
    queryFn: async () => {
      const url = category ? `/api/work?category=${category}` : '/api/work'
      const response = await fetch(url)
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.works
    },
  })
}

// 2) 단일 작업물 조회
export function useWork(workId: string) {
  return useQuery<Work, Error>({
    queryKey: ['works', workId],
    queryFn: async () => {
      const response = await fetch(`/api/work/${workId}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.work
    },
    enabled: !!workId,
  })
}

// 3) 작업물 생성
export function useCreateWork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: WorkInput) => {
      const response = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.work as Work
    },
    onSuccess: () => {
      // 작업물 목록 무효화 → 자동 재조회
      queryClient.invalidateQueries({ queryKey: ['works'] })
    },
  })
}

// 4) 작업물 수정
export function useUpdateWork() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: WorkInput & { id: string }) => {
      const response = await fetch(`/api/work/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.work as Work
    },
    onSuccess: (updatedWork) => {
      // 목록과 상세 모두 무효화
      queryClient.invalidateQueries({ queryKey: ['works'] })
      queryClient.invalidateQueries({ queryKey: ['works', updatedWork.id] })
    },
  })
}

// 5) 작업물 삭제 (낙관적 업데이트)
export function useDeleteWork() {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, string, { previousWorks?: Work[] }>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/work/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return { id }
    },
    // 낙관적 업데이트: 삭제 즉시 UI에서 제거
    onMutate: async (deletedId) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['works'] })

      // 이전 상태 백업
      const previousWorks = queryClient.getQueryData<Work[]>(['works'])

      // 즉시 UI 업데이트
      queryClient.setQueryData<Work[]>(['works'], (old) =>
        old ? old.filter((work) => work.id !== deletedId) : []
      )

      return { previousWorks }
    },
    // 에러 시 롤백
    onError: (err, deletedId, context) => {
      if (context?.previousWorks) {
        queryClient.setQueryData(['works'], context.previousWorks)
      }
    },
    // 성공 시 서버 데이터와 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] })
    },
  })
}
