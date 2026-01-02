import { createSlice } from "@reduxjs/toolkit";

const loadAccounts = () => {
    try {
        const stored = localStorage.getItem("accounts");
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

const getSafeItem = (key) => {
    const val = localStorage.getItem(key);
    if (!val || val === "undefined" || val === "null") return null;
    return val;
};

const storedAccounts = loadAccounts();
const activeUserId = getSafeItem("activeUserId");
const storedToken = getSafeItem("token");

// Find current account by ID (preferred) or fallback to token
const currentAccount = storedAccounts.find(acc => 
    (activeUserId && acc.user._id === activeUserId) || 
    (!activeUserId && acc.token === storedToken)
);

const initialState = {
  user: currentAccount ? currentAccount.user : null,
  token: currentAccount ? currentAccount.token : storedToken,
  role: currentAccount ? currentAccount.role : getSafeItem("role"),
  availableAccounts: storedAccounts,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
      
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("activeUserId", user._id);

      // Add or Update to availableAccounts
      const existingIndex = state.availableAccounts.findIndex(acc => acc.user._id === user._id);
      const newAccount = { user, token, role, lastActive: Date.now() };
      
      if (existingIndex >= 0) {
          state.availableAccounts[existingIndex] = newAccount;
      } else {
          state.availableAccounts.push(newAccount);
      }
      
      localStorage.setItem("accounts", JSON.stringify(state.availableAccounts));
    },
    
    switchAccount: (state, action) => {
        const targetUserId = action.payload;
        const targetAccount = state.availableAccounts.find(acc => acc.user._id === targetUserId);
        
        if (targetAccount) {
            state.user = targetAccount.user;
            state.token = targetAccount.token;
            state.role = targetAccount.role;
            
            localStorage.setItem("token", targetAccount.token);
            localStorage.setItem("role", targetAccount.role);
            localStorage.setItem("activeUserId", targetUserId);
        }
    },

    removeAccount: (state, action) => {
        const targetUserId = action.payload;
        state.availableAccounts = state.availableAccounts.filter(acc => acc.user._id !== targetUserId);
        localStorage.setItem("accounts", JSON.stringify(state.availableAccounts));
        
        if (localStorage.getItem("activeUserId") === targetUserId) {
            localStorage.removeItem("activeUserId");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
        }
    },

    logout: (state) => {
      if (state.user) {
          const userIdToRemove = state.user._id;
          state.availableAccounts = state.availableAccounts.filter(acc => acc.user._id !== userIdToRemove);
          localStorage.setItem("accounts", JSON.stringify(state.availableAccounts));
      }

      state.user = null;
      state.token = null;
      state.role = null;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("activeUserId");

      if (state.availableAccounts.length === 0) {
          localStorage.removeItem("accounts");
      }
    },
    
    updateUserStats: (state, action) => {
      if (state.user) {
        if (action.payload.leadCredits !== undefined) {
          state.user.leadCredits = action.payload.leadCredits;
        }
        if (action.payload.walletBalance !== undefined) {
           // Ensure wallet structure exists
           if (!state.user.wallet) state.user.wallet = {};
           state.user.wallet.balance = action.payload.walletBalance;
        }
        
        // Also update in availableAccounts
        const index = state.availableAccounts.findIndex(acc => acc.user._id === state.user._id);
        if (index >= 0) {
            state.availableAccounts[index].user = { ...state.user };
            localStorage.setItem("accounts", JSON.stringify(state.availableAccounts));
        }
      }
    },
  },
});

export const { setCredentials, logout, updateUserStats, switchAccount, removeAccount } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRole = (state) => state.auth.role;
export const selectAvailableAccounts = (state) => state.auth.availableAccounts;
