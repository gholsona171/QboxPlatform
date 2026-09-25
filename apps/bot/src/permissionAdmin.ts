import {
  DatabaseConfiguration,
  DatabaseService,
  PermissionBootstrapService,
  PrismaPermissionPersistenceClient,
} from "@qbox/database";
import {
  permissionCatalog,
  PersistentPermissionService,
} from "@qbox/permissions";
import { env } from "@qbox/shared";

type Operation = "owner-bootstrap" | "migrate-legacy-admin";

/** Runs one local, non-Discord persistent-permission administration workflow. */
export async function runPermissionAdministration(
  argv: readonly string[],
): Promise<void> {
  const operation = argv[0] as Operation | undefined;
  if (operation !== "owner-bootstrap" && operation !== "migrate-legacy-admin")
    throw new Error(
      "Expected owner-bootstrap or migrate-legacy-admin operation.",
    );
  const apply = argv.includes("--apply");
  const configuration = DatabaseConfiguration.from({
    databaseUrl: env.DATABASE_URL,
    environment: env.NODE_ENV,
  });
  const persistence = new PrismaPermissionPersistenceClient(configuration);
  const database = new DatabaseService(configuration, {
    create: () => persistence,
  });
  const startup = await database.start();
  if (!startup.started)
    throw new Error(
      `Database startup failed: ${startup.reason ?? startup.state}.`,
    );
  try {
    await persistence.repositories.definitions.synchronizeCatalog(
      permissionCatalog,
      {
        reasonCode: "system-maintenance",
        reason: "Permission operator CLI catalog synchronization.",
      },
    );
    const service = new PermissionBootstrapService(
      persistence.repositories.guilds,
      persistence.repositories.principals,
      persistence.repositories.permissions,
      new PersistentPermissionService(persistence.repositories.permissions),
    );
    if (operation === "owner-bootstrap") {
      const guildId = requiredFlag(argv, "--guild-id");
      const userId = requiredFlag(argv, "--user-id");
      const result = apply
        ? await service.applyOwner(guildId, userId)
        : {
            plan: await service.planOwner(guildId, userId),
            createdAssignments: 0,
          };
      writeResult(operation, apply, result);
      return;
    }
    const legacyGuildId =
      optionalFlag(argv, "--guild-id") ?? env.DISCORD_GUILD_ID;
    if (!legacyGuildId)
      throw new Error(
        "Legacy migration needs --guild-id <id> (or DISCORD_GUILD_ID).",
      );
    const result = apply
      ? await service.applyLegacyAdministrators(
          legacyGuildId,
          env.ADMIN_ROLE_IDS,
        )
      : {
          plan: await service.planLegacyAdministrators(
            legacyGuildId,
            env.ADMIN_ROLE_IDS,
          ),
          createdAssignments: 0,
        };
    writeResult(operation, apply, result);
    console.warn(
      "Compatibility remains enabled by default; environment grants cannot be revoked while it is active.",
    );
  } finally {
    await database.stop();
  }
}

function requiredFlag(argv: readonly string[], name: string): string {
  const value = optionalFlag(argv, name);
  if (!value) throw new Error(`${name} requires an explicit value.`);
  return value;
}

function optionalFlag(
  argv: readonly string[],
  name: string,
): string | undefined {
  const index = argv.indexOf(name);
  if (index < 0) return undefined;
  const value = argv[index + 1];
  if (!value || value.startsWith("--"))
    throw new Error(`${name} requires an explicit value.`);
  return value;
}

function writeResult(
  operation: Operation,
  apply: boolean,
  result: { readonly plan: unknown; readonly createdAssignments: number },
): void {
  console.log(
    JSON.stringify(
      {
        operation,
        mode: apply ? "apply" : "dry-run",
        ...result,
      },
      null,
      2,
    ),
  );
}

void runPermissionAdministration(process.argv.slice(2)).catch((error) => {
  console.error(
    JSON.stringify({
      operation: "permission-administration",
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown failure.",
    }),
  );
  process.exitCode = 1;
});
