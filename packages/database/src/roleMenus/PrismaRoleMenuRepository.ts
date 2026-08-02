import type {
  RoleMenu,
  RoleMenuAssignmentMode,
  RoleMenuDraftInput,
  RoleMenuOption,
  RoleMenuOptionInput,
  RoleMenuPresentationType,
  RoleMenuRepository,
  RoleMenuStatus,
} from "@qbox/role-menus";
import { RoleMenuError } from "@qbox/role-menus";
import type { Prisma, PrismaClient } from "@qbox/prisma";

type RoleMenuAccessor = Pick<PrismaClient, "roleMenu">;
type RoleMenuTransactionAccessor = Pick<PrismaClient, "roleMenu" | "roleMenuOption">;

const roleMenuInclude = {
  guild: true,
  options: { orderBy: { position: "asc" as const } },
} as const;

type RoleMenuWithOptions = Prisma.RoleMenuGetPayload<{ include: typeof roleMenuInclude }>;
type RoleMenuOptionRow = RoleMenuWithOptions["options"][number];

export class PrismaRoleMenuRepository implements RoleMenuRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async create(input: RoleMenuDraftInput): Promise<RoleMenu> {
    const guild = await this.client.guild.findUnique({
      where: { discordGuildId: input.guildId },
    });
    if (!guild) throw new RoleMenuError("INVALID_INPUT", "Guild is not registered.");
    const row = await this.client.roleMenu.create({
      data: {
        guildId: guild.id,
        channelId: input.channelId,
        title: input.title,
        ...(input.description === undefined ? {} : { description: input.description }),
        presentationType: input.presentationType,
        assignmentMode: input.assignmentMode,
        createdByDiscordUserId: input.createdByDiscordUserId,
      },
      include: roleMenuInclude,
    });
    return mapMenu(row);
  }

  public async update(id: string, input: Partial<Omit<RoleMenuDraftInput, "guildId" | "createdByDiscordUserId">>): Promise<RoleMenu> {
    const row = await this.client.roleMenu.update({
      where: { id },
      data: {
        ...(input.channelId === undefined ? {} : { channelId: input.channelId }),
        ...(input.title === undefined ? {} : { title: input.title }),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.presentationType === undefined ? {} : { presentationType: input.presentationType }),
        ...(input.assignmentMode === undefined ? {} : { assignmentMode: input.assignmentMode }),
        status: "DRAFT",
      },
      include: roleMenuInclude,
    });
    return mapMenu(row);
  }

  public async addOption(roleMenuId: string, input: RoleMenuOptionInput): Promise<RoleMenu> {
    return this.client.$transaction(async (tx) => {
      const count = await tx.roleMenuOption.count({ where: { roleMenuId } });
      const position = input.position ?? count;
      if (count >= 25) throw new RoleMenuError("INVALID_INPUT", "Role menu option limit reached.");
      await tx.roleMenuOption.create({
        data: {
          roleMenuId,
          roleId: input.roleId,
          label: input.label,
          ...(input.description === undefined ? {} : { description: input.description }),
          ...(input.emoji === undefined ? {} : { emoji: input.emoji }),
          position,
        },
      });
      await tx.roleMenu.update({ where: { id: roleMenuId }, data: { status: "DRAFT" } });
      return mapMenu(await requireMenu(tx, roleMenuId));
    });
  }

  public async updateOption(roleMenuId: string, optionId: string, input: Partial<RoleMenuOptionInput>): Promise<RoleMenu> {
    await this.client.roleMenuOption.update({
      where: { id: optionId, roleMenuId },
      data: {
        ...(input.roleId === undefined ? {} : { roleId: input.roleId }),
        ...(input.label === undefined ? {} : { label: input.label }),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.emoji === undefined ? {} : { emoji: input.emoji }),
        ...(input.position === undefined ? {} : { position: input.position }),
      },
    });
    await this.client.roleMenu.update({ where: { id: roleMenuId }, data: { status: "DRAFT" } });
    return mapMenu(await requireMenu(this.client, roleMenuId));
  }

  public async removeOption(roleMenuId: string, optionId: string): Promise<RoleMenu> {
    return this.client.$transaction(async (tx) => {
      await tx.roleMenuOption.delete({ where: { id: optionId, roleMenuId } });
      const options = await tx.roleMenuOption.findMany({ where: { roleMenuId }, orderBy: { position: "asc" } });
      for (const [position, option] of options.entries())
        await tx.roleMenuOption.update({ where: { id: option.id }, data: { position } });
      await tx.roleMenu.update({ where: { id: roleMenuId }, data: { status: "DRAFT" } });
      return mapMenu(await requireMenu(tx, roleMenuId));
    });
  }

  public async reorderOptions(roleMenuId: string, optionIds: readonly string[]): Promise<RoleMenu> {
    return this.client.$transaction(async (tx) => {
      for (const [position, id] of optionIds.entries())
        await tx.roleMenuOption.update({ where: { id, roleMenuId }, data: { position } });
      await tx.roleMenu.update({ where: { id: roleMenuId }, data: { status: "DRAFT" } });
      return mapMenu(await requireMenu(tx, roleMenuId));
    });
  }

  public async setPublished(roleMenuId: string, messageId: string): Promise<RoleMenu> {
    const row = await this.client.roleMenu.update({
      where: { id: roleMenuId },
      data: { messageId, status: "PUBLISHED" },
      include: roleMenuInclude,
    });
    return mapMenu(row);
  }

  public async setStatus(roleMenuId: string, status: RoleMenuStatus): Promise<RoleMenu> {
    const row = await this.client.roleMenu.update({
      where: { id: roleMenuId },
      data: { status },
      include: roleMenuInclude,
    });
    return mapMenu(row);
  }

  public async delete(roleMenuId: string): Promise<void> {
    await this.client.$transaction(async (tx) => {
      await tx.roleMenuOption.deleteMany({ where: { roleMenuId } });
      await tx.roleMenu.delete({ where: { id: roleMenuId } });
    });
  }

  public async findById(roleMenuId: string): Promise<RoleMenu | undefined> {
    const row = await this.client.roleMenu.findUnique({
      where: { id: roleMenuId },
      include: roleMenuInclude,
    });
    return row ? mapMenu(row) : undefined;
  }

  public async findByPublishedMessage(guildId: string, channelId: string, messageId: string): Promise<RoleMenu | undefined> {
    const row = await this.client.roleMenu.findFirst({
      where: { guild: { discordGuildId: guildId }, channelId, messageId },
      include: roleMenuInclude,
    });
    return row ? mapMenu(row) : undefined;
  }

  public async listByGuild(guildId: string): Promise<readonly RoleMenu[]> {
    const rows = await this.client.roleMenu.findMany({
      where: { guild: { discordGuildId: guildId } },
      orderBy: { createdAt: "desc" },
      include: roleMenuInclude,
    });
    return rows.map(mapMenu);
  }
}

async function requireMenu(client: RoleMenuAccessor | RoleMenuTransactionAccessor, roleMenuId: string): Promise<RoleMenuWithOptions> {
  const row = await client.roleMenu.findUnique({
    where: { id: roleMenuId },
    include: roleMenuInclude,
  });
  if (!row) throw new RoleMenuError("NOT_FOUND", "Role menu was not found.");
  return row;
}

function mapMenu(row: RoleMenuWithOptions): RoleMenu {
  return Object.freeze({
    id: row.id,
    guildId: row.guild.discordGuildId,
    channelId: row.channelId,
    ...(row.messageId ? { messageId: row.messageId } : {}),
    title: row.title,
    ...(row.description ? { description: row.description } : {}),
    presentationType: row.presentationType,
    assignmentMode: row.assignmentMode,
    status: row.status,
    createdByDiscordUserId: row.createdByDiscordUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    options: row.options.map(mapOption),
  });
}

function mapOption(row: RoleMenuOptionRow): RoleMenuOption {
  return Object.freeze({
    id: row.id,
    roleMenuId: row.roleMenuId,
    roleId: row.roleId,
    label: row.label,
    ...(row.description ? { description: row.description } : {}),
    ...(row.emoji ? { emoji: row.emoji } : {}),
    position: row.position,
    createdAt: row.createdAt,
  });
}
