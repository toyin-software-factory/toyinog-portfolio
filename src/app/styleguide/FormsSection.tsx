import { Field, Input, RadioGroup, Textarea } from "@/components/ui";

import { SpecimenLabel, StyleguideSection } from "./StyleguideSection";

const reasons = [
  { value: "hiring", label: "I'm hiring" },
  { value: "project", label: "I have a project" },
];

export function FormsSection() {
  return (
    <StyleguideSection
      id="forms"
      number="06"
      title="Form fields"
      intro="Every field has a visible label. Hints and errors are tied to the field for screen readers, and errors carry an icon and text, never colour alone."
    >
      <form
        aria-label="Form field examples"
        action="#"
        className="grid grid-cols-1 gap-10 md:grid-cols-2"
      >
        <div className="flex flex-col gap-8">
          <div>
            <SpecimenLabel>Default with hint</SpecimenLabel>
            <Field label="Name" id="sg-name" hint="So I know who I'm talking to.">
              {(control) => <Input {...control} autoComplete="name" />}
            </Field>
          </div>
          <div>
            <SpecimenLabel>Error</SpecimenLabel>
            <Field
              label="Email"
              id="sg-email"
              error="Enter an email address like name@example.com."
            >
              {(control) => (
                <Input {...control} type="email" defaultValue="toyin@" autoComplete="off" />
              )}
            </Field>
          </div>
          <div>
            <SpecimenLabel>Optional and disabled</SpecimenLabel>
            <Field label="Company" id="sg-company" optional>
              {(control) => <Input {...control} disabled defaultValue="Not editable" />}
            </Field>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div>
            <SpecimenLabel>Radio group</SpecimenLabel>
            <RadioGroup
              name="sg-reason"
              legend="What brings you here?"
              options={reasons}
              value="hiring"
            />
          </div>
          <div>
            <SpecimenLabel>Radio group with error</SpecimenLabel>
            <RadioGroup
              name="sg-reason-error"
              legend="Pick a reason"
              options={reasons}
              error="Choose one so I can reply in the right way."
            />
          </div>
          <div>
            <SpecimenLabel>Textarea</SpecimenLabel>
            <Field label="Message" id="sg-message" hint="A few lines is plenty.">
              {(control) => <Textarea {...control} rows={4} />}
            </Field>
          </div>
        </div>
      </form>
    </StyleguideSection>
  );
}
