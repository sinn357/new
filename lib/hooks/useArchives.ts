import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Archive } from '@/lib/archive-store'
import { z } from 'zod'
import { archiveSchema } from '@/lib/validations/archive'

type ArchiveInput = z.input<typeof archiveSchema>

// 1) 모든 아카이브 조회
export function useArchives(category?: string) {
  return useQuery<Archive[], Error>({
    queryKey: category ? ['archives', category] : ['archives'],
    queryFn: async () => {
      const url = category ? `/api/archive?category=${category}` : '/api/archive'
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch archives: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch archives')
      }
      return data.archives || []
    },
  })
}

// 2) 단일 아카이브 조회
export function useArchive(archiveId: string) {
  return useQuery<Archive, Error>({
    queryKey: ['archives', archiveId],
    queryFn: async () => {
      const response = await fetch(`/api/archive/${archiveId}`)
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.archive
    },
    enabled: !!archiveId,
  })
}

// 3) 아카이브 생성
export function useCreateArchive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ArchiveInput) => {
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.archive as Archive
    },
    onSuccess: () => {
      // 아카이브 목록 무효화 → 자동 재조회
      queryClient.invalidateQueries({ queryKey: ['archives'] })
    },
  })
}

// 4) 아카이브 수정
export function useUpdateArchive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: ArchiveInput & { id: string }) => {
      const response = await fetch(`/api/archive/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return data.archive as Archive
    },
    onSuccess: (updatedArchive) => {
      // 목록과 상세 모두 무효화
      queryClient.invalidateQueries({ queryKey: ['archives'] })
      queryClient.invalidateQueries({ queryKey: ['archives', updatedArchive.id] })
    },
  })
}

// 5) 아카이브 삭제 (낙관적 업데이트)
export function useDeleteArchive() {
  const queryClient = useQueryClient()

  return useMutation<{ id: string }, Error, string, { previousArchives?: Archive[] }>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/archive/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!data.success) throw new Error(data.error)
      return { id }
    },
    // 낙관적 업데이트: 삭제 즉시 UI에서 제거
    onMutate: async (deletedId) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['archives'] })

      // 이전 상태 백업
      const previousArchives = queryClient.getQueryData<Archive[]>(['archives'])

      // 즉시 UI 업데이트
      queryClient.setQueryData<Archive[]>(['archives'], (old) =>
        old ? old.filter((archive) => archive.id !== deletedId) : []
      )

      return { previousArchives }
    },
    // 에러 시 롤백
    onError: (err, deletedId, context) => {
      if (context?.previousArchives) {
        queryClient.setQueryData(['archives'], context.previousArchives)
      }
    },
    // 성공 시 서버 데이터와 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['archives'] })
    },
  })
}
