import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";

import { SafeUser } from "@/app/types";
import useLoginModal from "./useLoginModal";

interface IUseFavorite {
  listingId: string;
  currentUser?: SafeUser | null;
}

// Type guard to check if the value is an array of strings
function isStringArray(value: any): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

const useFavorite = ({ listingId, currentUser }: IUseFavorite) => {
  const [hasFavorited, setHasFavorited] = useState<boolean>(
    currentUser && isStringArray(currentUser.favoriteIds)
      ? currentUser.favoriteIds.includes(listingId)
      : false
  );

  const router = useRouter();
  const loginModal = useLoginModal();

  const toggleFavorite = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();

      //Check if currentUser is defined before proceeding
      if (!currentUser || !currentUser.favoriteIds) {
        loginModal.onOpen();
        return;
      }
      // Ensure that favoriteIds is an array of strings before attempting to call includes
      const favoriteIds = Array.isArray(currentUser.favoriteIds)
        ? currentUser.favoriteIds
        : [];
      const hasFavorited = favoriteIds.includes(listingId);

      // Optimistically update the UI to reflect the new favorite state
      setHasFavorited(!hasFavorited);

      try {
        // Toggle the favorite state on the server
        const method = hasFavorited ? "delete" : "post";
        const response = await axios[method](`/api/favorites/${listingId}`);

        // On success, confirm the optimistic update
        if (response.status === 200) {
          toast.success("Favorite updated!");
          router.refresh();
        } else {
          // If response status is not successful, revert the optimistic update
          setHasFavorited(hasFavorited);
          toast.error("Update failed, please try again.");
        }
      } catch (error) {
        // If there's an error, revert the optimistic update and log the error
        setHasFavorited(hasFavorited);
        console.error("Error toggling favorite:", error);
        toast.error("Something went wrong, please try again.");
      }
    },
    [currentUser, listingId, loginModal, router]
  );

  return {
    hasFavorited,
    toggleFavorite,
  };
};

export default useFavorite;
