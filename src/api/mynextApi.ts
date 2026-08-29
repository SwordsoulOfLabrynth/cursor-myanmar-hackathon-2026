import type {
  ConfirmActionRequest,
  ConfirmActionResponse,
  CustomerId,
  MynextApi,
  RecommendRequest,
} from "../../shared/api-contract.ts";
import {
  getCustomerContext,
  listCustomers,
  listPackages,
} from "../../shared/demoCatalog.ts";
import { recommend } from "../../shared/recommendEngine.ts";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function confirmAction(
  request: ConfirmActionRequest,
): Promise<ConfirmActionResponse> {
  await delay(280);
  return {
    ok: true,
    messageMm: `လုပ်ဆောင်ချက် လက်ခံပြီး (demo) — ${request.actionId}`,
  };
}

/** Mock implementation. Same types as future Convex functions. */
export const mynextApi: MynextApi = {
  async listCustomers() {
    await delay(80);
    return listCustomers();
  },
  async getCustomerContext(customerId: CustomerId) {
    await delay(80);
    return getCustomerContext(customerId);
  },
  async listPackages() {
    await delay(40);
    return listPackages();
  },
  async recommend(request: RecommendRequest) {
    await delay(420);
    return { ...recommend(request), source: "mock" };
  },
  confirmAction,
};

export const apiMode: "mock" = "mock";
