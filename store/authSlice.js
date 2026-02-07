import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
} from '../lib/auth';

// ═══════════════════════════════════════════════════════════
// Async Thunks
// ═══════════════════════════════════════════════════════════

// تسجيل مستخدم جديد
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }, { rejectWithValue }) => {
    const result = await registerWithEmail(email, password, displayName);
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    return result.user;
  }
);

// تسجيل الدخول بالبريد الإلكتروني
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const result = await loginWithEmail(email, password);
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    return result.user;
  }
);

// تسجيل الدخول بـ Google
export const loginWithGoogleAccount = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    const result = await loginWithGoogle();
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    return result.user;
  }
);

// تسجيل الخروج
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    const result = await logout();
    if (!result.success) {
      return rejectWithValue(result.error);
    }
    return true;
  }
);

// ═══════════════════════════════════════════════════════════
// Auth Slice
// ═══════════════════════════════════════════════════════════

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login with Google
    builder
      .addCase(loginWithGoogleAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogleAccount.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginWithGoogleAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;