"use client";

import { getBeatmap, getBeatmapSet } from "@/lib/database/beatmaps";
import { createList, deleteList, editList } from "@/lib/database/lists";
import { getUser } from "@/lib/database/users";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor as LibKeyboardSensor,
  PointerSensor as LibPointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Beatmap,
  BeatmapSet,
  List,
  ListBeatmapItem,
  ListBeatmapSetItem,
  ListUserItem,
  User,
} from "@prisma/client";
import { useNavigationGuard } from "next-navigation-guard";
import { useRouter } from "next/navigation";
import { KeyboardEvent, MouseEvent, useId, useState } from "react";
import { EditorListItem } from "./EditorListItem";
import styles from "./ListEditor.module.css";
import { ListItemAddForm } from "./ListItemAddForm";

export class PointerSensor extends LibPointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent: event }: MouseEvent) => {
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}

export class KeyboardSensor extends LibKeyboardSensor {
  static activators = [
    {
      eventName: "onKeyDown" as const,
      handler: ({ nativeEvent: event }: KeyboardEvent<Element>) => {
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}

function shouldHandleEvent(element: HTMLElement | null) {
  let cur = element;

  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false;
    }
    cur = cur.parentElement;
  }

  return true;
}

export function ListEditor({
  list,
}: {
  list?: List & {
    items: (
      | (ListBeatmapSetItem & { type: "beatmapSet"; beatmapSet: BeatmapSet })
      | (ListBeatmapItem & {
          type: "beatmap";
          beatmap: Beatmap & { beatmapSet: BeatmapSet };
        })
      | (ListUserItem & { type: "user"; user: User })
    )[];
  };
}) {
  const id = useId();
  const [name, setName] = useState(list?.name || "");
  const [description, setDescription] = useState(list?.description || "");
  const [items, setItems] = useState(
    list?.items.map((item) => ({ ...item, deleted: false })) || [],
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [changesSaved, setChangesSaved] = useState(true);
  const router = useRouter();

  useNavigationGuard({
    enabled: !changesSaved,
    confirm: (e) => {
      if (!e.to.includes("?1")) {
        return window.confirm("You have unsaved changes.");
      } else {
        return true;
      }
    },
  });

  async function saveList() {
    let newList;
    if (!list) {
      if (!name) {
        alert("Your list must have a name.");
        return;
      }

      newList = await createList({ name, description, isPublic: true, items });
    } else {
      newList = await editList(list.id, {
        name,
        description: description || undefined,
        items,
      });
    }

    if (!newList) {
      // TODO: ERROR
      return;
    }

    setChangesSaved(true);
    router.push(`/list/${newList.id}?1`);

    return newList;
  }

  async function addItem(id: number, type: "beatmapSet" | "beatmap" | "user") {
    let item: (
      | (ListBeatmapSetItem & {
          type: "beatmapSet";
          beatmapSet: BeatmapSet;
        })
      | (ListBeatmapItem & {
          type: "beatmap";
          beatmap: Beatmap & { beatmapSet: BeatmapSet };
        })
      | (ListUserItem & { type: "user"; user: User })
    ) & { deleted: boolean };

    if (type === "beatmap") {
      const map = await getBeatmap(id);

      if (!map) {
        // TODO: ERROR
        return;
      }

      item = {
        beatmap: map,
        beatmapId: map.id,
        id: -1,
        listId: list?.id || -1,
        comment: null,
        order: (items[items.length - 1]?.order || 0) + 1,
        createdAt: new Date(),
        type: "beatmap",
        deleted: false,
      };
    } else if (type === "beatmapSet") {
      const set = await getBeatmapSet(id);

      if (!set) {
        // TODO: ERROR
        return;
      }

      item = {
        beatmapSet: set,
        beatmapSetId: set.id,
        id: -1,
        listId: list?.id || -1,
        comment: null,
        order: (items[items.length - 1]?.order || 0) + 1,
        createdAt: new Date(),
        type: "beatmapSet",
        deleted: false,
      };
    } else if (type === "user") {
      const user = await getUser(id);

      if (!user) {
        // TODO: ERROR
        return;
      }

      item = {
        user: user,
        userId: user.id,
        id: -1,
        listId: list?.id || -1,
        comment: null,
        order: (items[items.length - 1]?.order || 0) + 1,
        createdAt: new Date(),
        type: "user",
        deleted: false,
      };
    } else {
      return;
    }

    setItems((prev) => [...prev, item]);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && over !== null) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.order === active.id);
        const newIndex = items.findIndex((item) => item.order === over.id);

        setChangesSaved(false);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      id={id}
    >
      <SortableContext
        items={items.map((i) => ({ id: i.order }))}
        strategy={verticalListSortingStrategy}
        key={"order"}
      >
        <div className={styles["list-header"]}>
          <label htmlFor="list-name" className={styles["label"]}>
            Name
          </label>
          <input
            id="list-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            className={styles["list-name"]}
            placeholder={"Your list needs a name!"}
          />
          <label htmlFor="list-description" className={styles["label"]}>
            Description
          </label>
          <textarea
            id="list-description"
            value={description || ""}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
            className={styles["list-description"]}
            placeholder="Write something about your list (optional)"
          />
          {list !== undefined ? (
            <button
              type="button"
              className={styles["delete-list"]}
              onClick={async () => {
                const confirmed = confirm(
                  "Really delete this list? This cannot be undone!",
                );

                if (!confirmed) {
                  return;
                }

                const success = await deleteList(list.id);

                if (success) {
                  router.push(`/user/${list.userId}`);
                }
              }}
            >
              [delete list]
            </button>
          ) : null}
        </div>
        <div className={"divider"} />
        <div className={styles["add-save-container"]}>
          <ListItemAddForm addItem={addItem} />
          <button
            type="button"
            onClick={saveList}
            className={styles["save-button"]}
          >
            Save
          </button>
        </div>
        <div className={styles["list-editor"]}>
          {items.filter((i) => !i.deleted).length > 0
            ? items
                .filter((i) => !i.deleted)
                .map((i, index) => (
                  <EditorListItem
                    index={index}
                    key={i.order}
                    item={i}
                    onDelete={async () => {
                      const confirmed = confirm(
                        "Really delete this list item?",
                      );

                      if (!confirmed) {
                        return;
                      }

                      setChangesSaved(false);
                      setItems(
                        items.map((item) =>
                          item.type === i.type && item.id === i.id
                            ? { ...item, deleted: true }
                            : item,
                        ),
                      );
                    }}
                    onCommentChange={async (e) => {
                      setChangesSaved(false);
                      setItems(
                        items.map((item) =>
                          item.type === i.type && item.id === i.id
                            ? { ...item, comment: e.target.value }
                            : item,
                        ),
                      );
                    }}
                  />
                ))
            : "No items in the list yet!"}
        </div>
      </SortableContext>
      <div className={styles["add-save-container"]}>
        <ListItemAddForm addItem={addItem} />
        <button
          type="button"
          onClick={saveList}
          className={styles["save-button"]}
        >
          Save
        </button>
      </div>
    </DndContext>
  );
}
