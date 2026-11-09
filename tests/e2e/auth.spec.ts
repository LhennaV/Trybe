import { expect, test } from "@playwright/test";
import { ERROR_MESSAGES } from "@/shared/contracts/common";
import { PASSWORD, adminClient, createUser, deleteUsers, uniqueUser } from "../integration/helpers";
import { latestConfirmLink } from "./mailbox";

// Critical account flows in a real browser on a phone-sized screen
// (docs/testing.md section 8, flow 1). Every test makes its own user.
const created: string[] = [];

test.afterAll(async () => {
  await deleteUsers(created);
});

async function idForEmail(email: string) {
  const { data } = await adminClient().auth.admin.listUsers({ perPage: 1000 });
  return data.users.find((u) => u.email === email)?.id;
}

test("a new user signs up, verifies their email, and lands in onboarding", async ({ page }) => {
  const user = uniqueUser("e2esign");

  await page.goto("/signup");
  await page.getByLabel("Display name").fill(user.displayName);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  // The agreement sheet: age, terms, privacy and guidelines (AUTH-03, AUTH-04).
  const agree = page.getByRole("button", { name: "Agree and create account" });
  await expect(agree).toBeDisabled();
  await page.getByRole("checkbox", { name: /or older/ }).check();
  await page.getByRole("checkbox", { name: /Terms of use/ }).check();
  await page.getByRole("checkbox", { name: /Privacy notice/ }).check();
  await agree.click();

  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  const id = await idForEmail(user.email);
  if (id) created.push(id);

  // Open the link from the email, like the person would (AUTH-05).
  await page.goto(await latestConfirmLink(user.email));
  await expect(page).toHaveURL(/\/onboarding\/hobbies/);

  // The link signed them in.
  const me = await page.request.get("/api/me");
  expect(me.status()).toBe(200);
  expect((await me.json()).data.emailVerified).toBe(true);
});

test("log in: wrong password, unverified email, then success", async ({ page }) => {
  const unverified = await createUser({ label: "e2eunv", verified: false });
  const verified = await createUser({ label: "e2elog" });
  created.push(unverified.id, verified.id);

  await page.goto("/login");
  await page.getByLabel("Email").fill(verified.email);
  await page.getByLabel("Password", { exact: true }).fill("not-the-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText(ERROR_MESSAGES.INVALID_CREDENTIALS)).toBeVisible();

  await page.getByLabel("Email").fill(unverified.email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByText("Verify your email first.")).toBeVisible();

  await page.getByLabel("Email").fill(verified.email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/feed/);
});

test("forgot password: email link, new password, log in with it", async ({ page }) => {
  const user = await createUser({ label: "e2ereset" });
  created.push(user.id);
  const newPassword = "brand-new-password-456";

  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(user.email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("Check your inbox.")).toBeVisible();

  await page.goto(await latestConfirmLink(user.email));
  await expect(page).toHaveURL(/\/reset-password/);

  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Type it again", { exact: true }).fill(newPassword);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(page.getByText("Password updated!")).toBeVisible();

  // The old password stops working and the new one works.
  const oldLogin = await page.request.post("/api/auth/login", { data: { email: user.email, password: PASSWORD } });
  expect(oldLogin.status()).toBe(401);
  const newLogin = await page.request.post("/api/auth/login", { data: { email: user.email, password: newPassword } });
  expect(newLogin.status()).toBe(200);
});
