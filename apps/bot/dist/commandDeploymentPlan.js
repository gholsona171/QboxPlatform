const ignoredKeys = new Set([
    "application_id",
    "applicationId",
    "descriptionLocalized",
    "guild_id",
    "guildId",
    "id",
    "nameLocalized",
    "policy",
    "version"
]);
const keyAliases = {
    autocomplete: "autocomplete",
    channelTypes: "channel_types",
    contexts: "contexts",
    defaultMemberPermissions: "default_member_permissions",
    descriptionLocalizations: "description_localizations",
    dmPermission: "dm_permission",
    handler: "handler",
    integrationTypes: "integration_types",
    maxLength: "max_length",
    maxValue: "max_value",
    minLength: "min_length",
    minValue: "min_value",
    nameLocalizations: "name_localizations"
};
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizedKey(key) {
    return keyAliases[key] ?? key;
}
function normalizeValue(value, parentKey) {
    if (Array.isArray(value)) {
        const normalized = value.map((item) => normalizeValue(item));
        if (parentKey === "channel_types" ||
            parentKey === "contexts" ||
            parentKey === "integration_types") {
            return [...normalized].sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
        }
        return normalized;
    }
    if (!isRecord(value)) {
        return value;
    }
    const normalizedEntries = Object.entries(value)
        .filter(([key, entryValue]) => !ignoredKeys.has(key) && entryValue !== undefined)
        .map(([key, entryValue]) => {
        const canonicalKey = normalizedKey(key);
        return [
            canonicalKey,
            normalizeValue(entryValue, canonicalKey)
        ];
    })
        .filter(([key, entryValue]) => {
        if (entryValue === null) {
            return false;
        }
        if (Array.isArray(entryValue) && entryValue.length === 0) {
            return false;
        }
        // Discord reports the default install type ([0] = server install) on
        // every global command; definitions that do not set it mean the same.
        if (key === "integration_types" &&
            Array.isArray(entryValue) &&
            entryValue.length === 1 &&
            entryValue[0] === 0) {
            return false;
        }
        return !((key === "required" || key === "autocomplete" || key === "nsfw") &&
            entryValue === false) && !(key === "dm_permission" && entryValue === true);
    })
        .sort(([left], [right]) => left.localeCompare(right));
    return Object.fromEntries(normalizedEntries);
}
export function normalizeCommandDefinition(definition) {
    const normalized = normalizeValue(definition);
    if (!isRecord(normalized)) {
        throw new Error("Discord command definition must be an object.");
    }
    return {
        type: 1,
        ...normalized
    };
}
function commandKey(definition) {
    const name = definition.name;
    const type = definition.type ?? 1;
    if (typeof name !== "string") {
        throw new Error("Discord command definition is missing a name.");
    }
    return `${String(type)}:${name}`;
}
function commandName(definition) {
    if (typeof definition.name !== "string") {
        throw new Error("Discord command definition is missing a name.");
    }
    return definition.name;
}
function indexedDefinitions(definitions) {
    const indexed = new Map();
    for (const definition of definitions) {
        const normalized = normalizeCommandDefinition(definition);
        const key = commandKey(normalized);
        if (indexed.has(key)) {
            throw new Error(`Duplicate Discord command definition '${key}'.`);
        }
        indexed.set(key, normalized);
    }
    return indexed;
}
export function createCommandDeploymentPlan(target, currentDefinitions, desiredDefinitions) {
    const current = indexedDefinitions(currentDefinitions);
    const desired = indexedDefinitions(desiredDefinitions);
    const additions = [];
    const updates = [];
    const removals = [];
    const unchanged = [];
    const keys = [...new Set([...current.keys(), ...desired.keys()])].sort();
    for (const key of keys) {
        const currentDefinition = current.get(key);
        const desiredDefinition = desired.get(key);
        const name = commandName(desiredDefinition ?? currentDefinition ?? {});
        if (!currentDefinition && desiredDefinition) {
            additions.push({ key, name, desired: desiredDefinition });
        }
        else if (currentDefinition && !desiredDefinition) {
            removals.push({ key, name, current: currentDefinition });
        }
        else if (currentDefinition && desiredDefinition) {
            const change = {
                key,
                name,
                current: currentDefinition,
                desired: desiredDefinition
            };
            if (JSON.stringify(currentDefinition) ===
                JSON.stringify(desiredDefinition)) {
                unchanged.push(change);
            }
            else {
                updates.push(change);
            }
        }
    }
    return {
        ...target,
        desiredCommandCount: desiredDefinitions.length,
        currentCommandCount: currentDefinitions.length,
        additions,
        updates,
        removals,
        unchanged
    };
}
export function commandDeploymentPlanSummary(plan) {
    return {
        deploymentScope: plan.scope,
        applicationId: plan.applicationId,
        targetGuildId: plan.guildId,
        currentCommandCount: plan.currentCommandCount,
        desiredCommandCount: plan.desiredCommandCount,
        additions: plan.additions.map((change) => change.name),
        updates: plan.updates.map((change) => change.name),
        removals: plan.removals.map((change) => change.name),
        unchanged: plan.unchanged.map((change) => change.name)
    };
}
//# sourceMappingURL=commandDeploymentPlan.js.map