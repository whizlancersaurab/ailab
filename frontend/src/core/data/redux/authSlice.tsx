import { createSlice, createAsyncThunk ,type PayloadAction} from "@reduxjs/toolkit";
import { userInfo } from "../../../service/api";

interface AuthState {
  user:string;
  schoolName:string;
  role:string,
  profileImage:string|null,
  schoolLogo:string|null,
  isAuth: boolean | null; 
  loading: boolean;
}

// Initial state
const initialState: AuthState = {
  user:"",
  role:'',
  schoolName:"",
  profileImage:null,
  schoolLogo:null,
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
      state.isAuth = null;
      state.loading = false;
      state.user="";
      state.schoolName="",
      state.role="",
      state.profileImage=null,
      state.schoolLogo=null
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
        state.schoolName=action.payload.name
        state.role=action.payload.role
        state.profileImage=action.payload.profileImage
        state.schoolLogo=action.payload.schoolLogo
        state.isAuth = true
        state.loading = false
      })
      .addCase(fetchAuthStatus.rejected, (state) => {
        state.schoolName= '';
        state.user='';
        state.role='',
        state.profileImage=null,
        state.schoolLogo=null,
        state.isAuth = false;
        state.loading = false;
      });
  },
});

export const { reset, setAuth } = authSlice.actions;

export default authSlice.reducer;
