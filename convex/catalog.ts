import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  getCustomerContext,
  listCustomers,
  listPackages,
} from "../shared/demoCatalog";
import {
  customerContextValidator,
  customerIdValidator,
  customerSummaryValidator,
  packageValidator,
} from "./validators";

export const listDemoCustomers = query({
  args: {},
  returns: v.array(customerSummaryValidator),
  handler: async () => {
    return listCustomers();
  },
});

export const getDemoCustomer = query({
  args: { customerId: customerIdValidator },
  returns: customerContextValidator,
  handler: async (_ctx, args) => {
    return getCustomerContext(args.customerId);
  },
});

export const listDemoPackages = query({
  args: {},
  returns: v.array(packageValidator),
  handler: async () => {
    return listPackages();
  },
});
