import { body, get, router } from "typepath";
import { z } from "zod";

const r = router({
  "/": body(
    z.object({
      name: z.string().min(3),
    })
  ).post((ctx) => {
    console.log(ctx);
    return { message: `Hello, ${ctx.body.name}!` };
  }),
});

r.listen({ port: 3001 });

console.log("Server running at http://localhost:3001/");
