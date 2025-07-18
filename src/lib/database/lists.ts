"use server";

import { nextAuthOptions } from "@/lib/auth";
import {
  Beatmap,
  BeatmapSet,
  ListBeatmapItem,
  ListBeatmapSetItem,
  ListUserItem,
  User,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";

export type ListOptions = {
  name: string;
  description?: string;
  isPublic: boolean;
  items?: ((
    | (ListBeatmapSetItem & { type: "beatmapSet"; beatmapSet: BeatmapSet })
    | (ListBeatmapItem & {
        type: "beatmap";
        beatmap: Beatmap & { beatmapSet: BeatmapSet };
      })
    | (ListUserItem & { type: "user"; user: User })
  ) & { deleted: boolean })[];
};

export async function createList({
  name,
  description,
  isPublic,
  items,
}: ListOptions) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return;
  }

  const list = await prisma.list.create({
    data: { name, description, isPublic, userId: session.user.id },
    include: {
      beatmapItems: {
        include: { beatmap: { include: { beatmapSet: true, owners: true } } },
      },
      beatmapSetItems: { include: { beatmapSet: { include: { user: true } } } },
      userItems: { include: { user: true } },
    },
  });

  for (const [index, item] of (items || [])
    .filter((i) => !i.deleted)
    .entries()) {
    if (item.type === "beatmapSet") {
      if (item.id === -1) {
        await prisma.listBeatmapSetItem.create({
          data: {
            beatmapSetId: item.beatmapSetId,
            listId: list.id,
            order: index + 1,
            comment: item.comment,
          },
        });
      } else if (item.deleted) {
        await prisma.listBeatmapSetItem.delete({
          where: { id: item.id },
        });
      } else {
        await prisma.listBeatmapSetItem.update({
          where: { id: item.id },
          data: { order: index + 1, comment: item.comment },
        });
      }
    } else if (item.type === "beatmap") {
      if (item.id === -1) {
        await prisma.listBeatmapItem.create({
          data: {
            beatmapId: item.beatmapId,
            listId: list.id,
            order: index + 1,
            comment: item.comment,
          },
        });
      } else if (item.deleted) {
        await prisma.listBeatmapItem.delete({
          where: { id: item.id },
        });
      } else {
        await prisma.listBeatmapItem.update({
          where: { id: item.id },
          data: { order: index + 1, comment: item.comment },
        });
      }
    } else if (item.type === "user") {
      if (item.id === -1) {
        await prisma.listUserItem.create({
          data: {
            userId: item.userId,
            listId: list.id,
            order: index + 1,
            comment: item.comment,
          },
        });
      } else if (item.deleted) {
        await prisma.listUserItem.delete({
          where: { id: item.id },
        });
      } else {
        await prisma.listUserItem.update({
          where: { id: item.id },
          data: { order: index + 1, comment: item.comment },
        });
      }
    } else {
      // TODO: Error or something
    }
  }

  return await getList(list.id);
}

export async function deleteList(listId: number) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return;
  }

  const list = await prisma.list.findFirst({ where: { id: listId } });

  if (!list || list.userId !== session.user.id) {
    // TODO: ERROR
    return;
  }

  await prisma.listBeatmapItem.deleteMany({ where: { id: list.id } });
  await prisma.listBeatmapSetItem.deleteMany({ where: { id: list.id } });
  await prisma.listUserItem.deleteMany({ where: { id: list.id } });
  await prisma.list.delete({ where: { id: list.id } });
  return true;
}

export async function getList(id: number) {
  const list = await prisma.list.findFirst({
    where: { id },
    include: {
      user: true,
      beatmapItems: {
        include: { beatmap: { include: { beatmapSet: true, owners: true } } },
      },
      beatmapSetItems: { include: { beatmapSet: { include: { user: true } } } },
      userItems: { include: { user: true } },
    },
  });

  if (!list) {
    return;
  }

  const items = [
    ...list.beatmapItems.map((item) => ({ ...item, type: "beatmap" as const })),
    ...list.beatmapSetItems.map((item) => ({
      ...item,
      type: "beatmapSet" as const,
    })),
    ...list.userItems.map((item) => ({ ...item, type: "user" as const })),
  ].sort((a, b) => a.order - b.order);

  return { ...list, items };
}

export type AnyListItem = Exclude<
  Awaited<ReturnType<typeof getList>>,
  undefined
>["items"][number];

export async function addItemToList(
  listId: number,
  itemId: number,
  type: "beatmap" | "beatmapSet" | "user",
) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return;
  }

  const list = await prisma.list.findFirst({
    where: { id: listId, userId: session.user.id },
    include: {
      beatmapItems: {
        include: { beatmap: { include: { beatmapSet: true, owners: true } } },
      },
      beatmapSetItems: { include: { beatmapSet: { include: { user: true } } } },
      userItems: { include: { user: true } },
    },
  });

  if (!list || list.userId !== session.user.id) {
    return;
  }

  const currentItems = [
    ...list.beatmapItems.map((item) => ({ ...item, type: "beatmap" as const })),
    ...list.beatmapSetItems.map((item) => ({
      ...item,
      type: "beatmapSet" as const,
    })),
    ...list.userItems.map((item) => ({ ...item, type: "user" as const })),
  ].sort((a, b) => a.order - b.order);

  const order = currentItems[currentItems.length - 1]?.order || 0;

  if (type === "beatmap") {
    const newItem = await prisma.listBeatmapItem.create({
      data: { listId: list.id, beatmapId: itemId, order: order + 1 },
      include: { beatmap: { include: { beatmapSet: true, owners: true } } },
    });

    currentItems.push({ ...newItem, type: "beatmap" });
    list.beatmapItems.push(newItem);
  } else if (type === "beatmapSet") {
    const newItem = await prisma.listBeatmapSetItem.create({
      data: { listId: list.id, beatmapSetId: itemId, order: order + 1 },
      include: { beatmapSet: { include: { user: true } } },
    });

    currentItems.push({ ...newItem, type: "beatmapSet" });
    list.beatmapSetItems.push(newItem);
  } else if (type === "user") {
    const newItem = await prisma.listUserItem.create({
      data: { listId: list.id, userId: itemId, order: order + 1 },
      include: { user: true },
    });

    currentItems.push({ ...newItem, type: "user" });
    list.userItems.push(newItem);
  }

  return { ...list, items: currentItems };
}

export async function getMyLists() {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    return [];
  }

  const myLists = await prisma.list.findMany({
    where: { userId: session.user.id },
  });

  return myLists;
}

export async function getUserLists(userId: number) {
  const lists = await prisma.list.findMany({
    where: { userId },
    include: {
      _count: {
        select: { beatmapItems: true, beatmapSetItems: true, userItems: true },
      },
    },
  });

  return lists;
}

export async function editList(
  listId: number,
  data: {
    name?: string;
    description?: string;
    items: ((
      | (ListBeatmapSetItem & { type: "beatmapSet"; beatmapSet: BeatmapSet })
      | (ListBeatmapItem & {
          type: "beatmap";
          beatmap: Beatmap & { beatmapSet: BeatmapSet };
        })
      | (ListUserItem & { type: "user"; user: User })
    ) & { deleted: boolean })[];
  },
) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    // TODO: error
    return;
  }

  const list = await prisma.list.findFirst({ where: { id: listId } });

  if (!list || list.userId !== session.user.id) {
    // TODO: error
    return;
  }

  for (const [index, item] of data.items.entries()) {
    if (item.type === "beatmapSet") {
      if (item.id === -1) {
        await prisma.listBeatmapSetItem.create({
          data: {
            beatmapSetId: item.beatmapSetId,
            listId: list.id,
            order: index + 1,
            comment: item.comment,
          },
        });
      } else if (item.deleted) {
        await prisma.listBeatmapSetItem.delete({
          where: { id: item.id },
        });
      } else {
        await prisma.listBeatmapSetItem.update({
          where: { id: item.id },
          data: { order: index + 1, comment: item.comment },
        });
      }
    } else if (item.type === "beatmap") {
      if (item.id === -1) {
        await prisma.listBeatmapItem.create({
          data: {
            beatmapId: item.beatmapId,
            listId: list.id,
            order: index + 1,
            comment: item.comment,
          },
        });
      } else if (item.deleted) {
        await prisma.listBeatmapItem.delete({
          where: { id: item.id },
        });
      } else {
        await prisma.listBeatmapItem.update({
          where: { id: item.id },
          data: { order: index + 1, comment: item.comment },
        });
      }
    } else if (item.type === "user") {
      if (item.id === -1) {
        await prisma.listUserItem.create({
          data: {
            userId: item.userId,
            listId: list.id,
            order: index + 1,
            comment: item.comment,
          },
        });
      } else if (item.deleted) {
        await prisma.listUserItem.delete({
          where: { id: item.id },
        });
      } else {
        await prisma.listUserItem.update({
          where: { id: item.id },
          data: { order: index + 1, comment: item.comment },
        });
      }
    } else {
      // TODO: Error or something
    }
  }

  if (data.name || data.description) {
    await prisma.list.update({
      where: { id: listId },
      data: {
        name: data.name || undefined,
        description: data.description || undefined,
      },
    });
  }

  return await getList(list.id);
}

// export async function deleteListItem(
//   itemId: number,
//   type: "beatmapSet" | "beatmap" | "user"
// ) {
//   const session = await getServerSession(nextAuthOptions);
//   let item;

//   if (type === "beatmapSet") {
//     item = await prisma.listBeatmapSetItem.findFirst({
//       where: { id: itemId },
//       include: { list: true },
//     });
//   } else if (type === "beatmap") {
//     item = await prisma.listBeatmapItem.findFirst({
//       where: { id: itemId },
//       include: { list: true },
//     });
//   } else if (type === "user") {
//     item = await prisma.listUserItem.findFirst({
//       where: { id: itemId },
//       include: { list: true },
//     });
//   }

//   if (!item || session?.user.id !== item.list.userId) {
//     // TODO: error
//     return;
//   }

//   if (type === "beatmapSet") {
//     await prisma.listBeatmapSetItem.delete({ where: { id: itemId } });
//   } else if (type === "beatmap") {
//     await prisma.listBeatmapItem.delete({ where: { id: itemId } });
//   } else if (type === "user") {
//     await prisma.listUserItem.delete({ where: { id: itemId } });
//   }

//   const newList = await getList(item.listId);
//   return newList;
// }
