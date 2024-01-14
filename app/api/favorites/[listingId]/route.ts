import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function POST(
  request: Request, 
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = params;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  // Ensure favoriteIds is an array before using it
  let favoriteIds = Array.isArray(currentUser.favoriteIds)
    ? [...currentUser.favoriteIds]
    : [];

  // Check if listingId is already in favoriteIDs to avoid duplicates
  if (!favoriteIds.includes(listingId)) {
    favoriteIds.push(listingId);

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: { favoriteIds: favoriteIds },
    });

    return NextResponse.json(user);
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = params;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  // Ensure favoriteIds is an array before using it
  let favoriteIds = Array.isArray(currentUser.favoriteIds)
    ? [...currentUser.favoriteIds]
    : [];

  // Remove listingId from favoriteIds if it exists
  const index = favoriteIds.indexOf(listingId);
  if (index > -1) {
    favoriteIds.splice(index, 1);

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: { favoriteIds: favoriteIds },
    });

    return NextResponse.json(user);
  }
}
