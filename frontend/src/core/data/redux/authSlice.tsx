import { createSlice, createAsyncThunk ,type PayloadAction} from "@reduxjs/toolkit";
import { userInfo } from "../../../service/api";

interface AuthState {
  userId:number|null,
  user:string;
  role:string,
  profileImage:string|null,
  isAuth: boolean | null; 
  loading: boolean
}

// Initial state
const initialState: AuthState = {
  userId:null,
  user:"",
  role:'',
  profileImage:null,
  isAuth: null,
  loading: true,
};

export const fetchAuthStatus = createAsyncThunk(
  "auth/fetchStatus",
  async (_, thunkAPI) => {
    try {
      const { data } = await userInfo();
    
      if(data?.success) return data.data
    } catch (error) {
      return thunkAPI.rejectWithValue(false);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.userId=null,
      state.isAuth = null;
      state.loading = false;
      state.user="";
      state.role="",
      state.profileImage=null

    },
    setAuth: (state, action: PayloadAction<boolean>) => {
      state.isAuth = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuthStatus.fulfilled, (state, action: PayloadAction<any>) => {
       
        state.user=`${action.payload.firstname} ${action.payload.lastname??''}`;
        state.userId = action.payload.userId
        state.role=action.payload.role
        state.profileImage=action.payload.profileImage
      
        state.isAuth = true
        state.loading = false
      })
      .addCase(fetchAuthStatus.rejected, (state) => {
       
        state.user='';
        state.role='',
        state.profileImage=null,
       
        state.isAuth = false;
        state.loading = false;
      });
  },
});

export const { reset, setAuth } = authSlice.actions;

export default authSlice.reducer;
