/**
 * Auth Slice - Redux Toolkit
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@services/auth.service';
import { setAuthToken, removeAuthToken } from '@services/api';
import { STORAGE_KEYS } from '@utils/constants';
import type { AuthState, LoginRequest, RegisterRequest, User } from '@types';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      await setAuthToken(response.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      await setAuthToken(response.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    await removeAuthToken();
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.CART);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Logout failed';
    return rejectWithValue(message);
  }
});

export const loadStoredAuth = createAsyncThunk('auth/loadStoredAuth', async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return { user, token };
    }

    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load auth';
    return rejectWithValue(message);
  }
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const user = await authService.getCurrentUser();
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user';
    return rejectWithValue(message);
  }
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearAuth: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: builder => {
    // Login
    builder.addCase(login.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, state => {
      state.isLoading = false;
    });

    // Register
    builder.addCase(register.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, state => {
      state.isLoading = false;
    });

    // Logout
    builder.addCase(logout.fulfilled, state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });

    // Load stored auth
    builder.addCase(loadStoredAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      }
    });

    // Get current user
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { updateUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
