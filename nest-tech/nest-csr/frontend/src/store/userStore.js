import { create } from 'zustand';
import { getUsers, createUser, updateUser, deleteUser, batchDeleteUsers } from '../api/userService';

export const useUserStore = create((set, get) => ({
  users: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedUsers: new Set(),
  sortConfig: null,

  // 设置搜索词
  setSearchTerm: (term) => set({ searchTerm: term }),

  // 设置选中的用户
  setSelectedUsers: (users) => set({ selectedUsers: users }),

  // 切换用户选中状态
  toggleUserSelection: (userId) => {
    set((state) => {
      const newSelectedUsers = new Set(state.selectedUsers);
      if (newSelectedUsers.has(userId)) {
        newSelectedUsers.delete(userId);
      } else {
        newSelectedUsers.add(userId);
      }
      return { selectedUsers: newSelectedUsers };
    });
  },

  // 全选/取消全选
  toggleSelectAll: () => {
    set((state) => {
      const visibleUsers = get().getVisibleUsers();
      if (state.selectedUsers.size === visibleUsers.length) {
        return { selectedUsers: new Set() };
      } else {
        return { selectedUsers: new Set(visibleUsers.map(user => user.id)) };
      }
    });
  },

  // 设置排序配置
  setSortConfig: (config) => set({ sortConfig: config }),

  // 获取可见的用户（根据搜索词过滤）
  getVisibleUsers: () => {
    const { users, searchTerm, sortConfig } = get();
    
    // 搜索过滤
    let filteredUsers = [...users];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredUsers = users.filter(
        user => 
          user.name.toLowerCase().includes(term) || 
          user.email.toLowerCase().includes(term)
      );
    }

    // 排序
    if (sortConfig !== null) {
      filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredUsers;
  },

  // 加载用户列表
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getUsers();
      set({ users: data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || '加载用户列表失败', loading: false });
    }
  },

  // 添加用户
  addUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const newUser = await createUser(userData);
      set((state) => ({
        users: [...state.users, newUser],
        loading: false
      }));
      return newUser;
    } catch (error) {
      set({ error: error.response?.data?.message || '添加用户失败', loading: false });
      throw error;
    }
  },

  // 更新用户
  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await updateUser(userId, userData);
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? updatedUser : user
        ),
        loading: false
      }));
      return updatedUser;
    } catch (error) {
      set({ error: error.response?.data?.message || '更新用户失败', loading: false });
      throw error;
    }
  },

  // 删除单个用户
  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      await deleteUser(userId);
      set((state) => ({
        users: state.users.filter(user => user.id !== userId),
        selectedUsers: new Set([...state.selectedUsers].filter(id => id !== userId)),
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || '删除用户失败', loading: false });
      throw error;
    }
  },

  // 批量删除用户
  batchDeleteUsers: async () => {
    const { selectedUsers } = get();
    if (selectedUsers.size === 0) return;

    set({ loading: true, error: null });
    try {
      await batchDeleteUsers(Array.from(selectedUsers));
      set((state) => ({
        users: state.users.filter(user => !state.selectedUsers.has(user.id)),
        selectedUsers: new Set(),
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || '批量删除失败', loading: false });
      throw error;
    }
  }
}));