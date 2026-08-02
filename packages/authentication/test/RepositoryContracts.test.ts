import { describe, expect, it } from "vitest";

import type {
  AuthenticationTransactionContext,
  AuthenticationUnitOfWork,
  PlatformUser,
  PlatformUserId,
  PlatformUserRepository,
} from "../src/index.js";
import { platformUser } from "./fixtures.js";

class InMemoryPlatformUserRepository implements PlatformUserRepository {
  readonly #records = new Map<PlatformUserId, PlatformUser>();

  public async findById(id: PlatformUserId): Promise<PlatformUser | undefined> {
    return this.#records.get(id);
  }

  public async create(user: PlatformUser): Promise<PlatformUser> {
    if (this.#records.has(user.id)) throw new Error("conflict");
    this.#records.set(user.id, user);
    return user;
  }

  public async updateStatus(): Promise<PlatformUser> {
    throw new Error("not used by this contract fixture");
  }
}

describe("repository contracts", () => {
  it("allow a dependency-injected platform-user repository fixture", async () => {
    const repository: PlatformUserRepository =
      new InMemoryPlatformUserRepository();
    const account = platformUser();
    await expect(repository.create(account)).resolves.toBe(account);
    await expect(repository.findById(account.id)).resolves.toBe(account);
    await expect(repository.create(account)).rejects.toThrow("conflict");
  });

  it("keeps unit-of-work callbacks transport and persistence agnostic", async () => {
    const account = platformUser();
    const platformUsers = new InMemoryPlatformUserRepository();
    const context = { platformUsers } as AuthenticationTransactionContext;
    const unitOfWork: AuthenticationUnitOfWork = {
      run: async (operation) => operation(context),
    };
    await expect(
      unitOfWork.run(({ platformUsers: repository }) =>
        repository.create(account),
      ),
    ).resolves.toBe(account);
  });
});
