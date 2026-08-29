import { v } from "convex/values";
import { recommend as ruleRecommend } from "../shared/recommendEngine";
import { action } from "./_generated/server";
import { customerIdValidator, recommendResponseValidator } from "./validators";

/**
 * Public demo action — synthetic customers only, no end-user auth.
 * Keep RecommendResponse identical to the mock client.
 */
export const recommend = action({
  args: {
    customerId: customerIdValidator,
    message: v.string(),
  },
  returns: recommendResponseValidator,
  handler: async (_ctx, args) => {
    const result = ruleRecommend({
      customerId: args.customerId,
      message: args.message,
    });
    return { ...result, source: "rules" as const };
  },
});
