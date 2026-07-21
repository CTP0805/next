"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type FavoriteItem = {
  id: number;
  title: string;
  city: string;
  category_name: string | null;
  price: number;
  image_url: string | null;
  rating: number;
  review_count: number;
};

type FavoriteContextType = {
  favoriteIds: number[];
  favoriteItems: FavoriteItem[];
  loading: boolean;
  isFavorite: (experienceId: number) => boolean;
  toggleFavorite: (experienceId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
  clearFavorites: () => void;
};

const FavoriteContext = createContext<FavoriteContextType | null>(null);

type FavoriteProviderProps = {
  children: ReactNode;
};

const API_URL = "http://localhost:3001/api/member/favorites";

export function FavoriteProvider({ children }: FavoriteProviderProps) {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshFavorites = useCallback(async () => {
    try {
      const response = await fetch(API_URL, {
        credentials: "include",
      });

      // 尚未登入
      if (response.status === 401) {
        setFavoriteIds([]);
        setFavoriteItems([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`取得心願清單失敗：${response.status}`);
      }

      const result = await response.json();

      if (
        result.status !== "success" ||
        !result.data ||
        !Array.isArray(result.data.favoriteIds) ||
        !Array.isArray(result.data.items)
      ) {
        throw new Error("心願清單資料格式不正確");
      }

      setFavoriteIds(result.data.favoriteIds.map(Number));

      setFavoriteItems(
        result.data.items.map((item: FavoriteItem) => ({
          ...item,
          id: Number(item.id),
          price: Number(item.price),
          rating: Number(item.rating),
          review_count: Number(item.review_count),
        })),
      );
    } catch (error) {
      console.error(error);
      setFavoriteIds([]);
      setFavoriteItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  const isFavorite = (experienceId: number) => {
    return favoriteIds.includes(experienceId);
  };

  const toggleFavorite = async (experienceId: number) => {
    const alreadyFavorite = favoriteIds.includes(experienceId);

    const response = await fetch(`${API_URL}/${experienceId}`, {
      method: alreadyFavorite ? "DELETE" : "POST",
      credentials: "include",
    });

    if (response.status === 401) {
      throw new Error("請先登入");
    }

    if (!response.ok) {
      const result = await response.json().catch(() => null);

      throw new Error(result?.message ?? "心願清單操作失敗");
    }

    // 重新取得完整收藏資料，讓所有頁面與卡片同步
    await refreshFavorites();
  };

  const clearFavorites = () => {
    setFavoriteIds([]);
    setFavoriteItems([]);
  };

  return (
    <FavoriteContext.Provider
      value={{
        favoriteIds,
        favoriteItems,
        loading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
        clearFavorites,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);

  if (!context) {
    throw new Error("useFavorites 必須在 FavoriteProvider 裡使用");
  }

  return context;
}
