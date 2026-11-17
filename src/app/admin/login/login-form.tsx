"use client";

import { useActionState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { PasswordInput, PasswordInputControl, PasswordInputToggle } from "@ui-sdk/react/password-input";
import { login, type LoginState } from "./actions";

const control =
  "w-full rounded-xl border border-border bg-bg-0 px-4 py-2.5 text-base text-foreground outline-none transition-colors focus-visible:border-amber";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  return (
    <form action={action} className="space-y-5">
      <Field name="username" invalid={!!state.error}>
        <FieldLabel className="mb-1.5 block text-sm font-semibold">Username</FieldLabel>
        <Input autoComplete="username" required autoFocus className={control} />
      </Field>
      <Field name="password" invalid={!!state.error}>
        <FieldLabel className="mb-1.5 block text-sm font-semibold">Password</FieldLabel>
        <PasswordInput autoComplete="current-password" required className="relative block">
          <PasswordInputControl className={`${control} pr-12`} />
          <PasswordInputToggle
            aria-label="Show password"
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {(s) => (s.visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />)}
          </PasswordInputToggle>
        </PasswordInput>
        {state.error && <FieldError className="mt-2 block text-sm text-destructive">{state.error}</FieldError>}
      </Field>
      <Button
        type="submit"
        disabled={pending}
        focusableWhenDisabled
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ember font-semibold text-[#1a120d] transition-colors hover:bg-amber data-disabled:opacity-70"
      >
        <LockKeyhole className="size-4" aria-hidden />
        {pending ? "Checking…" : "Sign in"}
      </Button>
    </form>
  );
}
