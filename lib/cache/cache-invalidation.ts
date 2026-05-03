/**
 * Improved cache invalidation strategy
 * Replaces broad tag-based invalidation with granular control
 */

import { revalidateTag, revalidatePath } from "next/cache";

const IMMEDIATE_REVALIDATE = { expire: 0 } as const;

/**
 * Cache invalidation levels (from specific to broad)
 */
export enum InvalidationLevel {
  SINGLE_ITEM = "single",
  COLLECTION = "collection",
  RELATED_COLLECTIONS = "related",
  GLOBAL = "global",
}

/**
 * Granular cache invalidation handler
 * Prevents unnecessarily invalidating unrelated cached data
 */
export class CacheInvalidator {
  /**
   * Invalidate single item and its collection
   * Use when updating/deleting a specific item
   */
  static invalidateSingleItem(
    entityType: string,
    itemId: string,
    relatedCollections?: string[]
  ): void {
    // Invalidate the specific item
    revalidateTag(`${entityType}-${itemId}`, IMMEDIATE_REVALIDATE);

    // Invalidate the collection tag
    revalidateTag(`${entityType}-list`, IMMEDIATE_REVALIDATE);

    // Invalidate related collections if needed
    if (relatedCollections) {
      relatedCollections.forEach((collection) => {
        revalidateTag(`${collection}-list`, IMMEDIATE_REVALIDATE);
      });
    }
  }

  /**
   * Invalidate collection and filters
   * Use when creating items or modifying filters
   */
  static invalidateCollection(
    entityType: string,
    filterTags?: string[]
  ): void {
    // Always invalidate base list
    revalidateTag(`${entityType}-list`, IMMEDIATE_REVALIDATE);

    // Invalidate filtered views
    if (filterTags) {
      filterTags.forEach((tag) => {
        revalidateTag(`${entityType}-${tag}`, IMMEDIATE_REVALIDATE);
      });
    }
  }

  /**
   * Invalidate related collections for referential integrity
   * Use when an item's relationship changes
   */
  static invalidateRelationships(
    primaryEntity: string,
    primaryId: string,
    relatedEntities: Array<{
      entity: string;
      id: string;
    }>
  ): void {
    // Invalidate primary item
    revalidateTag(`${primaryEntity}-${primaryId}`, IMMEDIATE_REVALIDATE);

    // Invalidate all related items and collections
    relatedEntities.forEach(({ entity, id }) => {
      revalidateTag(`${entity}-${id}`, IMMEDIATE_REVALIDATE);
      revalidateTag(`${entity}-list`, IMMEDIATE_REVALIDATE);
    });

    // Invalidate primary collection
    revalidateTag(`${primaryEntity}-list`, IMMEDIATE_REVALIDATE);
  }

  /**
   * Strategic global invalidation
   * Use only when broad changes affect many entities
   */
  static invalidateGlobal(): void {
    revalidatePath("/");
  }
}

/**
 * Example usage patterns for different entities
 */

// Subject changes
export const subjectCacheInvalidation = {
  onCreate: () => {
    CacheInvalidator.invalidateCollection("subject");
  },

  onUpdate: (subjectId: string) => {
    CacheInvalidator.invalidateSingleItem("subject", subjectId, [
      "instructor",
      "offered-subject",
      "curriculum",
    ]);
  },

  onDelete: (subjectId: string) => {
    CacheInvalidator.invalidateSingleItem("subject", subjectId, [
      "instructor",
      "offered-subject",
      "curriculum",
    ]);
  },

  onAssignInstructor: (subjectId: string, instructorId: string) => {
    CacheInvalidator.invalidateRelationships("subject", subjectId, [
      { entity: "instructor", id: instructorId },
    ]);
  },
};

// Instructor changes
export const instructorCacheInvalidation = {
  onCreate: () => {
    CacheInvalidator.invalidateCollection("instructor");
  },

  onUpdate: (instructorId: string) => {
    CacheInvalidator.invalidateSingleItem("instructor", instructorId, [
      "subject",
      "offered-subject",
    ]);
  },

  onStatusChange: (instructorId: string) => {
    CacheInvalidator.invalidateSingleItem("instructor", instructorId);
  },
};

// Notice changes
export const noticeCacheInvalidation = {
  onCreate: () => {
    CacheInvalidator.invalidateCollection("notice");
  },

  onUpdate: (noticeId: string) => {
    CacheInvalidator.invalidateSingleItem("notice", noticeId);
  },

  onDelete: (noticeId: string) => {
    CacheInvalidator.invalidateSingleItem("notice", noticeId);
  },

  onPublish: () => {
    // Invalidate public notices specifically
    CacheInvalidator.invalidateCollection("notice", ["public"]);
  },
};

// Student changes
export const studentCacheInvalidation = {
  onCreate: () => {
    CacheInvalidator.invalidateCollection("student");
  },

  onUpdate: (studentId: string) => {
    CacheInvalidator.invalidateSingleItem("student", studentId);
  },

  onEnrollment: (studentId: string, semesterId: string) => {
    CacheInvalidator.invalidateRelationships("student", studentId, [
      { entity: "semester-registration", id: semesterId },
    ]);
  },
};

/**
 * Best practices:
 *
 * 1. SINGLE_ITEM Level (Most Specific):
 *    - Use for UPDATE operations on a specific record
 *    - Invalidates: [entity-id], [entity-list]
 *    - Fastest recovery time
 *    - Example: Updating subject title
 *
 * 2. COLLECTION Level:
 *    - Use for CREATE operations
 *    - Use for DELETE operations
 *    - Invalidates: [entity-list], [entity-filter-tags]
 *    - Medium recovery time
 *    - Example: Adding new subject
 *
 * 3. RELATED_COLLECTIONS Level:
 *    - Use when relationships change (foreign keys)
 *    - Invalidates: Primary item + related collections
 *    - Longer recovery time
 *    - Example: Assigning instructor to subject
 *
 * 4. GLOBAL Level (Use Sparingly):
 *    - Use only for system-wide changes
 *    - Example: Configuration changes affecting all pages
 *    - Avoid in most scenarios
 */
