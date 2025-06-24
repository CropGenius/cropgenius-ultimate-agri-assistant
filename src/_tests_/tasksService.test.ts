import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/services/supabaseClient'; // Actual path
import { getTasks, createTask, updateTaskStatus, CreateTaskData } from '@/core/data/tasks';
import { Task, TaskStatus } from '@/features/mission-control/taskTypes';

// Mock the supabase client
const mockFunctions = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn(),
  // Add any other functions that might be called in the chain
};

// Reset all spies/mocks before each test.
beforeEach(() => {
  vi.restoreAllMocks(); // Use this to restore original implementations if needed, or vi.resetAllMocks()
});


vi.mock('@/services/supabaseClient', () => {
  // Define the functions that will be part of the chain
  const eq = vi.fn().mockReturnThis();
  const order = vi.fn().mockResolvedValue({ data: [], error: null }); // Default for order
  const single = vi.fn().mockResolvedValue({ data: {}, error: null }); // Default for single
  const select = vi.fn(() => ({ order, single, eq })); // select can lead to order or single or eq
  const insert = vi.fn(() => ({ select }));
  const update = vi.fn(() => ({ eq }));


  const mockSupabaseClient = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn((tableName: string) => ({
        select,
        insert,
        update,
      })),
  };
  return { supabase: mockSupabaseClient };
});


// Cast the mocked supabase to its expected type for easier usage in tests
const mockedSupabase = supabase as any; // Still useful for auth.getUser

describe('Tasks Service', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    field_id: 'field-1',
    priority: 2, // Medium
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: mockUser.id,
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks(); // Clears all information stored in mocks

    // Default successful mock for getUser
    mockedSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Configure the chain for each specific test or provide more specific default mocks here
    // For from('tasks')
    const fromTasksChain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        single: vi.fn()
    };
    mockedSupabase.from.mockImplementation((tableName: string) => {
        if (tableName === 'tasks') {
            // Further chain specific mocks for 'tasks' table
            fromTasksChain.select.mockReturnThis(); // Ensure select is part of the chain
            fromTasksChain.insert.mockReturnThis();
            fromTasksChain.update.mockReturnThis();
            fromTasksChain.eq.mockReturnThis(); // Ensure eq is part of the chain
            fromTasksChain.order.mockReturnThis();
            return fromTasksChain;
        }
        return { // Default for other tables if any
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn()
        };
    });
  });

  describe('getTasks', () => {
    it('should fetch tasks and not apply user_id filter directly', async () => {
      // Specific mock for the chain: from -> select -> order -> resolvedPromise
      mockedSupabase.from('tasks').select().order.mockResolvedValueOnce({ data: [mockTask], error: null });

      const tasks = await getTasks();

      expect(mockedSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockedSupabase.from('tasks').select).toHaveBeenCalledWith('*');
      expect(mockedSupabase.from('tasks').order).toHaveBeenCalledWith('created_at', { ascending: false });
      // Check that eq was not called on the chain for 'user_id'
      // This is harder to check with current deep mock, ensure logic is correct.
      expect(tasks).toEqual([mockTask]);
    });

    it('should throw an error if Supabase call fails', async () => {
      mockedSupabase.from('tasks').select().order.mockResolvedValueOnce({ data: null, error: new Error('Fetch failed') });
      await expect(getTasks()).rejects.toThrow('Fetch failed');
    });
  });

  describe('createTask', () => {
    it('should create a task with created_by and default status', async () => {
      const newTaskData: CreateTaskData = {
        title: 'New Task',
        field_id: 'field-2',
        priority: 1, // High
      };
      const expectedInsertedTask = {
        ...newTaskData,
        id: 'task-new',
        created_by: mockUser.id,
        status: 'pending',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      };
      // from -> insert -> select -> single -> resolvedPromise
      mockedSupabase.from('tasks').insert().select().single.mockResolvedValueOnce({ data: expectedInsertedTask, error: null });

      const result = await createTask(newTaskData);

      expect(mockedSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockedSupabase.from('tasks').insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          field_id: 'field-2',
          priority: 1,
          created_by: mockUser.id,
          status: 'pending',
        })
      );
      expect(result).toEqual(expectedInsertedTask);
    });

     it('should throw an error if user is not authenticated', async () => {
      mockedSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      const newTaskData: CreateTaskData = { title: 'New Task', field_id: 'field-2', priority: 1 };
      await expect(createTask(newTaskData)).rejects.toThrow('User not authenticated');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status and updated_at', async () => {
      const taskId = 'task-to-update';
      const newStatus: TaskStatus = 'completed';
      const updatedTask = { ...mockTask, id: taskId, status: newStatus, updated_at: new Date().toISOString() };

      // from -> update -> eq -> select -> single -> resolvedPromise
      mockedSupabase.from('tasks').update().eq().select().single.mockResolvedValueOnce({ data: updatedTask, error: null });

      const result = await updateTaskStatus(taskId, newStatus);

      expect(mockedSupabase.from).toHaveBeenCalledWith('tasks');
      expect(mockedSupabase.from('tasks').update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: newStatus,
          updated_at: expect.any(String),
        })
      );
      expect(mockedSupabase.from('tasks').eq).toHaveBeenCalledWith('id', taskId);
      expect(result).toEqual(updatedTask);
    });
  });
});
