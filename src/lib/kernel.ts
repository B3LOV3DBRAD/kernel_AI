import { Kernel } from "@onkernel/sdk";

export const kernel = new Kernel({
  apiKey: process.env.KERNEL_API_KEY,
});
