import type { Interaction, ModalBuilder } from "discord.js";
import { ApplicationService, InMemoryApplicationRepository, type ApplicationFormInput } from "@qbox/applications";
import { describe, expect, it, vi } from "vitest";

import { ApplicationElevation } from "../src/applications/applicationActor.js";
import { DiscordApplicationInteractionHandler, formPicker } from "../src/applications/DiscordApplicationInteractionHandler.js";
import { ApplicationsCommand } from "../src/commands/Applications.command.js";
import { ApplyCommand } from "../src/commands/Apply.command.js";
import { CommandLoader } from "../src/loaders/CommandLoader.js";
import { createTestAuthorizer } from "./CommandTestFactory.js";

const GUILD = "100000000000000001";

function formInput(questions: number): ApplicationFormInput {
  return {
    guildId: GUILD,
    name: "Staff",
    enabled: true,
    questions: Array.from({ length: questions }, (_, index) => ({ id: `q${index}`, label: `Question ${index + 1}`, type: index === 0 ? "YES_NO" as const : "SHORT" as const, required: true, choices: [] })),
    cooldownDays: 0,
    onePending: true,
    requiredRoleIds: [],
    blockedRoleIds: [],
    reviewerRoleIds: [],
    pingMemberIds: [],
    acceptRoleIds: [],
    removeRoleIds: [],
    buttonStyle: "PRIMARY",
    position: 0,
  };
}

function interaction(fields: Record<string, unknown>): Interaction {
  return {
    id: "1",
    guildId: GUILD,
    user: { id: "800000000000000000", username: "alex", globalName: "Alex" },
    member: { roles: [], displayName: "Alex" },
    memberPermissions: { has: () => false },
    isButton: () => false,
    isStringSelectMenu: () => false,
    isModalSubmit: () => false,
    isRepliable: () => true,
    ...fields,
  } as unknown as Interaction;
}

describe("application commands", () => {
  it("are discovered and pass Discord validation", async () => {
    const names = (await new CommandLoader().load()).commands.map((command) => command.data.name);
    expect(names).toEqual(expect.arrayContaining(["apply", "applications"]));
    const applications = new ApplicationsCommand().data.toJSON();
    expect(applications.options?.map((option) => option.name)).toEqual(["list", "view", "accept", "deny", "panel"]);
  });

  it("let every member run them and explain when unavailable", async () => {
    expect(new ApplyCommand().bypassAuthorization()).toBe(true);
    expect(new ApplyCommand().policy.permissions).toBeUndefined();
    const editReply = vi.fn(async () => undefined);
    await new ApplyCommand().execute({ editReply, interaction: { guildId: GUILD } } as never);
    expect(editReply).toHaveBeenCalledWith({ content: "Applications are not available right now." });
  });

  it("builds a picker of open forms with reasons for the others", async () => {
    const service = new ApplicationService(new InMemoryApplicationRepository());
    const form = await service.saveForm(formInput(2));
    const picker = formPicker([{ form, canApply: true }, { form: { ...form, name: "Closed" }, canApply: false, reason: "Closed applications are closed." }]);
    expect(picker.content).toContain("Closed applications are closed.");
    expect(picker.components[0]?.toJSON().components[0]).toMatchObject({ custom_id: "qbox:applications:pick", options: [{ label: "Staff", value: form.id }] });
    expect(formPicker([]).components).toEqual([]);
  });

  it("opens the first page of five questions from a panel button", async () => {
    const service = new ApplicationService(new InMemoryApplicationRepository());
    const form = await service.saveForm(formInput(7));
    const handler = new DiscordApplicationInteractionHandler(service, new ApplicationElevation(createTestAuthorizer()));
    const showModal = vi.fn(async (_modal: ModalBuilder) => undefined);
    await handler.handle(interaction({ isButton: () => true, customId: `qbox:applications:open:${form.id}`, showModal }));
    const modal = showModal.mock.calls[0]?.[0]?.toJSON();
    expect(modal).toMatchObject({ custom_id: `qbox:applications:page:${form.id}:0`, title: "Staff (1/2)" });
    expect(modal?.components).toHaveLength(5);
    expect(modal?.components[0]).toMatchObject({ label: "Question 1", component: { type: 3, custom_id: "q0" } });
  });
});
