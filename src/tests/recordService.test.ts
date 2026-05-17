import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { recordService } from '@/services/recordService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('recordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRecords', () => {
    it('should throw an error if user is not logged in', async () => {
      (supabase.auth.getUser as Mock).mockResolvedValue({ data: { user: null } });

      await expect(recordService.createRecords([])).rejects.toThrow('로그인이 필요합니다.');
    });

    it('should insert multiple records with user_id', async () => {
      const mockUser = { id: 'user-123' };
      (supabase.auth.getUser as Mock).mockResolvedValue({ data: { user: mockUser } });

      const mockRecords = [
        { question: 'Q1', answer: 'A1', question_type: 'type1' },
        { question: 'Q2', answer: 'A2', question_type: 'type2' },
      ];

      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({ data: [{ id: '1' }, { id: '2' }], error: null });

      (supabase.from as Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
      });

      const result = await recordService.createRecords(mockRecords, 'private');

      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('records');
      expect(mockInsert).toHaveBeenCalledWith([
        { ...mockRecords[0], user_id: mockUser.id, visibility: 'private' },
        { ...mockRecords[1], user_id: mockUser.id, visibility: 'private' },
      ]);
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('updateRecord', () => {
    it('should update a record with given id and updates', async () => {
      const recordId = 'record-123';
      const updates = { answer: 'Updated Answer', visibility: 'public' as const };
      const mockUpdatedRecord = { id: recordId, ...updates };

      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedRecord, error: null });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockDelete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });

      (supabase.from as Mock).mockImplementation((table) => {
        if (table === 'records') {
          return { update: mockUpdate };
        }
        if (table === 'record_group_access') {
          return { delete: mockDelete };
        }
        return {};
      });

      const result = await recordService.updateRecord(recordId, updates);

      expect(supabase.from).toHaveBeenCalledWith('records');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', recordId);
      expect(result).toEqual(mockUpdatedRecord);
    });

    it('should throw an error if update fails', async () => {
      const recordId = 'record-123';
      const updates = { answer: 'Updated Answer' };
      const mockError = { message: 'Update failed' };

      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
      const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as Mock).mockReturnValue({
        update: mockUpdate,
      });

      await expect(recordService.updateRecord(recordId, updates)).rejects.toThrow();
    });
  });
});
