"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button, Field, Input, RadioGroup, Textarea } from "@/components/ui";
import { AlertIcon } from "@/components/ui/icons";
import type { ContactState } from "@/lib/contact/handle";
import {
  CONTACT_FIELDS,
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
  type ContactField,
  HONEYPOT_FIELD,
} from "@/lib/contact/fields";

import { sendContact } from "./actions";
import { formMessage } from "./messages";
import { Turnstile, type TurnstileHandle } from "./Turnstile";

const initialState: ContactState = { status: "idle" };

const typeOptions = CONTACT_TYPES.map((value) => ({ value, label: CONTACT_TYPE_LABELS[value] }));

const fieldLabels: Record<ContactField, string> = {
  name: "Name",
  email: "Email",
  type: "What's this about?",
  message: "Message",
};

/** Where each summary link points: the field, or the first radio of the group. */
const fieldTarget = (field: ContactField): string => (field === "type" ? "type-hiring" : field);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

type ContactFormProps = {
  readonly turnstileSiteKey: string;
  /** Shown in the send failure message. */
  readonly email: string;
};

export function ContactForm({ turnstileSiteKey, email }: ContactFormProps) {
  const [state, formAction] = useActionState(sendContact, initialState);
  const alertRef = useRef<HTMLDivElement>(null);
  const turnstile = useRef<TurnstileHandle>(null);

  const values = state.status === "idle" ? null : state.values;
  const errors = state.status === "invalid" ? state.errors : {};
  const errorFields = CONTACT_FIELDS.filter((field) => errors[field]);
  const message = formMessage(state, email);

  // After every answer from the server: move focus to the summary or message, and
  // get a fresh Turnstile token (each token works once).
  useEffect(() => {
    if (state.status === "idle") return;
    alertRef.current?.focus();
    turnstile.current?.reset();
  }, [state]);

  return (
    <form
      action={formAction}
      noValidate
      className="flex flex-col gap-8"
      aria-describedby="contact-privacy"
    >
      {errorFields.length > 0 ? (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="contact-error-title"
          className="flex flex-col gap-3 border-l-2 border-danger bg-surface p-5"
        >
          <h2
            id="contact-error-title"
            className="flex items-center gap-2 font-sans text-h3 text-text"
          >
            <AlertIcon className="size-5 text-danger" />
            There{" "}
            {errorFields.length === 1
              ? "is a problem"
              : `are ${String(errorFields.length)} problems`}{" "}
            with your message
          </h2>
          <ul className="flex flex-col gap-1">
            {errorFields.map((field) => (
              <li key={field}>
                <a
                  href={`#${fieldTarget(field)}`}
                  className="text-danger underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {fieldLabels[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {message ? (
        <div
          ref={alertRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-3 border-l-2 border-danger bg-surface p-5 text-text"
        >
          <AlertIcon className="mt-1 size-5 shrink-0 text-danger" />
          <p>{message}</p>
        </div>
      ) : null}

      {/* Honeypot (AC-2, AC-4): hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Website</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Field label={fieldLabels.name} id="name" error={errors.name}>
        {(control) => (
          <Input
            {...control}
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            defaultValue={values?.name}
          />
        )}
      </Field>

      <Field
        label={fieldLabels.email}
        id="email"
        hint="I'll reply to this address."
        error={errors.email}
      >
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            required
            maxLength={254}
            defaultValue={values?.email}
          />
        )}
      </Field>

      <RadioGroup
        name="type"
        legend={fieldLabels.type}
        options={typeOptions}
        value={values?.type}
        required
        error={errors.type}
      />

      <Field
        label={fieldLabels.message}
        id="message"
        hint="A few lines about the role or the project. At least 20 characters."
        error={errors.message}
      >
        {(control) => (
          <Textarea
            {...control}
            name="message"
            rows={7}
            required
            minLength={20}
            maxLength={5000}
            defaultValue={values?.message}
          />
        )}
      </Field>

      <Turnstile siteKey={turnstileSiteKey} ref={turnstile} />

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
