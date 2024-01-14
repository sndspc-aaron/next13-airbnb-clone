import prisma from "@/app/libs/prismadb";

import getCurrentUser from "./getCurrentUser";

export default async function getFavoriteListings() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return [];
    }

    // Filter and convert favoriteIds to string array
    const favoriteIds = Array.isArray(currentUser.favoriteIds)
    ? currentUser.favoriteIds.filter((id): id is string => typeof id === 'string')
    : [];

    const favorites = await prisma.listing.findMany({
      where: {
        id: {
          in: favoriteIds
        }
      }
    });

    const safeFavorites = favorites.map((favorite) => ({
      ...favorite,
      createdAt: favorite.createdAt.toString(),
    }));

    return safeFavorites;
  } catch (error: any) {
    throw new Error(error);
  }
}
