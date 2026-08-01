# Discord Command Authoring

Commands live in `packages/discord/src/commands/`. A production command file must end in `.command.ts` and export exactly one command instance through the named `command` export. The loader does not select default or ambiguous exports.

Use Discord.js `SlashCommandBuilder` directly. Every command must provide `type`, `data`, a complete execution `policy`, and an asynchronous `execute()` method. The validator runs before registration and deployment.

## Policy checklist

- `contexts`: `guild`, `dm`, or `both`.
- `permissions`: optional required permission names, `all` or `any` evaluation, and an explicit administrator override choice. Authorization remains server-side.
- `response.acknowledgement`: use `immediate` for fast work and `deferred` when external work may approach Discord's acknowledgement deadline.
- `response.visibility`: `ephemeral` or `public`.
- `cooldown`: optional `user` or `guild` scope with a positive duration in milliseconds.
- `concurrency`: `single`, `user`, `guild`, or `unlimited`.

Commands read inputs through `context.options`, route subcommands through `context.route`, and respond through `context.reply`. Missing or invalid input should throw `CommandInputError`; the interaction handler gives the user a safe ephemeral message. Unexpected errors are logged and receive a generic response. Long-running code must observe `context.signal` and stop promptly when it is aborted by an execution timeout or shutdown.

## Documentation-only example

This example is not discovered or deployed. It illustrates a realistic, permission-protected announcement command with one required and one optional input.

```ts
import { SlashCommandBuilder } from "discord.js";
import type { CommandExecutionContext, DiscordCommand } from "@qbox/discord";

class AnnounceCommand implements DiscordCommand {
  readonly type = "chat-input" as const;
  readonly data = new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Manage staff announcements.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("preview")
        .setDescription("Preview an announcement without publishing it.")
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Announcement text.")
            .setRequired(true),
        )
        .addBooleanOption((option) =>
          option
            .setName("urgent")
            .setDescription("Mark the preview as urgent."),
        ),
    );

  readonly policy = {
    contexts: "guild",
    permissions: {
      required: ["platform.admin"],
      mode: "all",
      administratorOverride: true,
    },
    response: { acknowledgement: "immediate", visibility: "ephemeral" },
    cooldown: { scope: "user", durationMs: 2_000 },
    concurrency: "user",
  } as const;

  async execute(context: CommandExecutionContext): Promise<void> {
    await context.route.dispatch({
      preview: async () => {
        if (context.signal.aborted) return;
        const message = context.options.requiredString("message");
        const urgent = context.options.optionalBoolean("urgent") ?? false;
        await context.reply({
          content: `${urgent ? "URGENT: " : ""}${message}`,
        });
      },
    });
  }
}
```

## Required tests and release check

Use `DiscordCommandTestKit.ts` for execution contexts, guild/DM interactions, option resolvers, deferred state, cooldown clocks, concurrency gates, and abort behavior. Test successful execution, permissions and context rejection, input failures, response policy, cooldown/concurrency behavior, and abort cooperation where applicable.

Before a live guild check, run `pnpm build`, `pnpm typecheck`, and `pnpm test`, then preview with `pnpm --filter @qbox/bot deploy:commands:dev:dry-run`. Deploy with `pnpm --filter @qbox/bot deploy:commands:dev`, start the bot, and verify both the Discord response and structured terminal logs. Global deployment is an explicit production operation described in the operations runbook.
