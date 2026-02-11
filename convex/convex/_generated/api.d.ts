/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as admin from "../admin.js";
import type * as agents from "../agents.js";
import type * as connector from "../connector.js";
import type * as directMessages from "../directMessages.js";
import type * as documents from "../documents.js";
import type * as feed from "../feed.js";
import type * as health from "../health.js";
import type * as messages from "../messages.js";
import type * as missions from "../missions.js";
import type * as notifications from "../notifications.js";
import type * as orchestrator from "../orchestrator.js";
import type * as runEngine from "../runEngine.js";
import type * as runSteps from "../runSteps.js";
import type * as runs from "../runs.js";
import type * as schedules from "../schedules.js";
import type * as seed from "../seed.js";
import type * as tasks from "../tasks.js";
import type * as waves from "../waves.js";
import type * as workflowSeeds from "../workflowSeeds.js";
import type * as workflowWaves from "../workflowWaves.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  admin: typeof admin;
  agents: typeof agents;
  connector: typeof connector;
  directMessages: typeof directMessages;
  documents: typeof documents;
  feed: typeof feed;
  health: typeof health;
  messages: typeof messages;
  missions: typeof missions;
  notifications: typeof notifications;
  orchestrator: typeof orchestrator;
  runEngine: typeof runEngine;
  runSteps: typeof runSteps;
  runs: typeof runs;
  schedules: typeof schedules;
  seed: typeof seed;
  tasks: typeof tasks;
  waves: typeof waves;
  workflowSeeds: typeof workflowSeeds;
  workflowWaves: typeof workflowWaves;
  workflows: typeof workflows;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
