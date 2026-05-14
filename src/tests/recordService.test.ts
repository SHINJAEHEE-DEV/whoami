import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordService } from '@/services/recordService';
import { supabase } from '@/lib/supabase';

describe('recordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRecords', () => {
    it('should throw an error if user is not logged in', async () => {
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: null } });

      await expect(recordService.createRecords([])).rejects.toThrow('로그인이 필요합니다.');
    });

    it('should insert multiple records with user_id', async () => {
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser } });

      const mockRecords = [
        { question: 'Q1', answer: 'A1', visibility: 'private' as const, question_type: 'type1' },
        { question: 'Q2', answer: 'A2', visibility: 'public' as const, question_type: 'type2' },
      ];

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null });

      (supabase.from as any).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
      });

      const result = await (recordService as any).createRecords(mockRecords);

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('records');
      expect(mockInsert).toHaveBeenCalledWith([
        { ...mockRecords[0], user_id: mockUser.id },
        { ...mockRecords[1], user_id: mockUser.id },
      ]);
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });
});
