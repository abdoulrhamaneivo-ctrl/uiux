import { action, page, query, route, type Spec } from "@wasp.sh/spec";

import { DemoAppPage } from "./DemoAppPage" with { type: "ref" };
import { PlanActionPage } from "./PlanActionPage" with { type: "ref" };
import {
  createTask,
  deleteTask,
  generateGptResponse,
  getAllTasksByUser,
  getGptResponses,
  updateTask,
} from "./operations" with { type: "ref" };

export const demoAiAppSpec: Spec = [
  route("DemoAppRoute", "/demo-app", page(DemoAppPage, { authRequired: true })),
  route("PlanActionRoute", "/plan-action", page(PlanActionPage, { authRequired: true })),

  query(getGptResponses, { entities: ["User", "GptResponse"] }),
  action(generateGptResponse, { entities: ["User", "Task", "GptResponse"] }),

  query(getAllTasksByUser, { entities: ["Task"] }),
  action(createTask, { entities: ["Task", "Alerte"] }),
  action(updateTask, { entities: ["Task", "Alerte"] }),
  action(deleteTask, { entities: ["Task"] }),
];
