import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

let hasFetched = false; // 👈 Global flag (can move to Redux if needed)

// Async thunk to fetch categories securely
export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (getValidToken, { rejectWithValue }) => {
    if (hasFetched) return []; // 🧠 Already fetched, skip!

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const getTokenWithRetry = async (maxAttempts = 10, delay = 500) => {
      let attempt = 0;
      while (attempt < maxAttempts) {
        const token = await getValidToken();

        if (token && typeof token === "string" && token.length > 10) {
          return token;
        }

        if (attempt === 5) {
          localStorage.removeItem("authToken"); // force token refresh
        }

        await wait(delay);
        attempt++;
      }

      throw new Error("❌ Auth token unavailable after multiple retries.");
    };

    const fetchWithAuth = async (url, retry = false) => {
      try {
        const token = await getTokenWithRetry();

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 && !retry) {
          localStorage.removeItem("authToken");
          return await fetchWithAuth(url, true);
        }

        if (!res.ok) {
          const errText = await res.text();
          console.error(`❌ HTTP ${res.status}:`, errText);
          return rejectWithValue(errText);
        }

        return await res.json();
      } catch (err) {
        return rejectWithValue(err.message);
      }
    };

    const data = await fetchWithAuth("/api/homeCategory");

    if (!data) return [];

    const formatted = data
      .map((category) => {
        const validSubcategories = (category.subcategories || [])
          .filter((sub) => sub?.name && sub?.slug)
          .map((sub) => ({
            name: sub.name,
            slug: sub.slug,
            parentSlug: category.slug,
          }));

        return {
          title: category.name,
          parentSlug: category.slug,
          links: validSubcategories,
        };
      })
      .filter((category) => category.links.length > 0);

    hasFetched = true; // ✅ Mark it fetched after successful response

    return formatted;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length > 0) {
          state.list = action.payload;
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  },
});

export default categorySlice.reducer;
