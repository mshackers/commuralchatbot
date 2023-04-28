import { z } from "zod";

export const Response = z.object({
  text: z.string(),
  sourceDocuments: z.array(
    z.object({
      pageContent: z.string(),
      metadata: z.object({
        source: z.string(),
        pdf: z.object({
          version: z.string(),
          info: z.any(),
          metadata: z.any(),
          totalPages: z.number(),
        }),
        loc: z.object({
          pageNumber: z.number(),
          lines: z.object({ from: z.number(), to: z.number() }),
        }),
      }),
    })
  ),
});
export type ResponseType = z.infer<typeof Response>;
