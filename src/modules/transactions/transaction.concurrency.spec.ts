import supertest from "supertest";
import app from "../../app";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";

const request = supertest(app);

const maybeDescribe = env.DATABASE_URL ? describe : describe.skip;

maybeDescribe("Transaction Engine - Concurrency & Race Condition Test", () => {
  let authToken: string;
  let userId: string;
  let sourceAccountId: string;
  let expenseCategoryId: string;

  beforeAll(async () => {
    // 1. Setup Test User & Login
    const email = `test_race_${Date.now()}@ledgerly.com`;
    const password = "password123";

    const registerRes = await request
      .post("/api/auth/register")
      .send({ email, password });
    userId = registerRes.body.user.id;

    const loginRes = await request
      .post("/api/auth/login")
      .send({ email, password });
    authToken = loginRes.body.token;

    // 2. Setup Source Account
    const accountRes = await request
      .post("/api/account")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Bank Test", type: "BANK", currency: "IDR" });

    sourceAccountId = accountRes.body.account.id;

    // 3. Setup Expense Category
    const categoryRes = await request
      .post("/api/category")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Jajan Race", type: "EXPENSE" });

    expenseCategoryId = categoryRes.body.category.id;

    // 4. Inject Initial Balance via Direct Ledger Deposit (1.000.000 IDR)
    await prisma.journal.create({
      data: {
        userId,
        idempotencyKey: `init_${Date.now()}`,
        description: "Initial Deposit for Race Condition Test",
        occurredAt: new Date(),
        entries: {
          create: [
            { accountId: sourceAccountId, type: "DEBIT", amount: 1000000 },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    // Cleanup DB after tests
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("should handle 10 concurrent requests correctly without going below zero balance", async () => {
    // Try to withdraw 150.000 IDR simultaneously 10 times (Total requested: 1.500.000 IDR)
    // Initial Balance is 1.000.000 IDR. Max successful requests should be EXACTLY 6!
    const withdrawalAmount = 150000;
    const concurrentRequests = Array.from({ length: 10 }).map(() =>
      request
        .post("/api/transaction")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          type: "EXPENSE",
          amount: withdrawalAmount,
          accountId: sourceAccountId,
          categoryId: expenseCategoryId,
          occurredAt: new Date().toISOString(),
        }),
    );

    const responses = await Promise.all(concurrentRequests);

    const successCount = responses.filter((res) => res.status === 201).length;
    const failedCount = responses.filter((res) => res.status === 400).length;

    // Verify system behavior under heavy load
    console.log(
      `[RACE CONDITION TEST RESULT] Success: ${successCount}, Failed: ${failedCount}`,
    );

    // Fetch Final Balance via Account API
    const finalAccountRes = await request
      .get(`/api/account/${sourceAccountId}`)
      .set("Authorization", `Bearer ${authToken}`);

    const finalBalance = Number(finalAccountRes.body.account.balance);

    expect(finalBalance).toBeGreaterThanOrEqual(0);
    expect(successCount + failedCount).toBe(10);
  });
});
