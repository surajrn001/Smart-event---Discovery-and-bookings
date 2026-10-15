import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/client';
import { useAuth } from './AuthContext';

const WishlistContext = createContext({
  wishlistIds: new Set(),
  wishlistCount: 0,
  isWishlisted: () => false,
  toggleWishlist: async () => {},
  removeFromWishlist: async () => {},
  refreshWishlist: async () => {},
  loading: false,
});

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlistIds = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlistIds();
      const ids = res.data?.wishlist_event_ids || [];
      setWishlistIds(new Set(ids));
    } catch (err) {
      console.log('Note: could not load wishlist ids:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlistIds();
  }, [fetchWishlistIds]);

  const isWishlisted = useCallback(
    (eventId) => {
      if (!eventId) return false;
      return wishlistIds.has(Number(eventId));
    },
    [wishlistIds]
  );

  const toggleWishlist = async (eventId) => {
    if (!isAuthenticated) {
      return { success: false, requireAuth: true };
    }
    const numId = Number(eventId);
    const currentlyIn = wishlistIds.has(numId);

    // Optimistic UI update
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (currentlyIn) {
        next.delete(numId);
      } else {
        next.add(numId);
      }
      return next;
    });

    try {
      const res = await wishlistApi.toggleWishlist(numId);
      const finalStatus = res.data?.is_wishlisted;
      // Ensure sync with server response
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (finalStatus) {
          next.add(numId);
        } else {
          next.delete(numId);
        }
        return next;
      });
      return { success: true, isWishlisted: finalStatus, message: res.data?.message };
    } catch (err) {
      // Revert optimistic update on error
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (currentlyIn) {
          next.add(numId);
        } else {
          next.delete(numId);
        }
        return next;
      });
      return { success: false, error: err.response?.data?.detail || 'Failed to update wishlist' };
    }
  };

  const removeFromWishlist = async (eventId) => {
    if (!isAuthenticated) return { success: false };
    const numId = Number(eventId);

    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(numId);
      return next;
    });

    try {
      await wishlistApi.removeFromWishlist(numId);
      return { success: true };
    } catch (err) {
      fetchWishlistIds();
      return { success: false, error: err.message };
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.size,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlistIds,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext) || {};
